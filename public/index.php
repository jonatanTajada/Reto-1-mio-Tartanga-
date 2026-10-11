<?php
declare(strict_types=1);
/** Punto de entrada único del API; selecciona rutas y transforma errores en respuestas seguras. */
require dirname(__DIR__) . '/app/bootstrap.php';

use App\Controller\{AuthController, EquipamientoController, NotificacionController, UbicacionController, UsuarioController};
use App\Dao\{EquipamientoDAO, HistoricoDAO, NotificacionDAO, UbicacionDAO, UsuarioDAO};
use App\Exception\HttpException;
use App\Http\Sesion;
use App\Model\{Conexion, Equipamiento, Notificacion, Usuario, Validacion};
use App\View\Respuesta;

ini_set('display_errors', '0');
try {
    Sesion::iniciar();
    $metodo = $_SERVER['REQUEST_METHOD'];
    $ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $permitidos = [];
    $modulo = null;
    $id = null;
    $accion = null;
    if (in_array($ruta, ['/api/sesion', '/api/login', '/api/logout', '/api/catalogos'], true)) {
        $permitidos = in_array($ruta, ['/api/login', '/api/logout'], true) ? ['POST'] : ['GET'];
    } elseif (preg_match('#^/api/(usuarios|equipamientos|ubicaciones|notificaciones)(?:/([0-9]+)(?:/(ubicacion|historial|estado))?)?$#D', $ruta, $partes)) {
        $modulo = $partes[1];
        $id = isset($partes[2]) ? Validacion::id($partes[2]) : null;
        $accion = $partes[3] ?? null;
        if ($accion === null) {
            $permitidos = $id === null ? ['GET', 'POST'] : ['GET', 'PUT', 'DELETE'];
        } elseif ($modulo === 'equipamientos' && $accion === 'historial') {
            $permitidos = ['GET'];
        } elseif (($modulo === 'equipamientos' && $accion === 'ubicacion') || ($modulo === 'notificaciones' && $accion === 'estado')) {
            $permitidos = ['PATCH'];
        }
    }
    if (!$permitidos) {
        throw new HttpException(404, 'La ruta solicitada no existe.');
    }
    if (!in_array($metodo, $permitidos, true)) {
        header('Allow: ' . implode(', ', $permitidos));
        throw new HttpException(405, 'Este método HTTP no está permitido en la ruta.');
    }
    if ($metodo !== 'GET') {
        Sesion::csrf();
    }
    if ($ruta === '/api/logout') {
        Sesion::limpiar();
        $datos = Sesion::datos(null);
    } elseif ($ruta === '/api/sesion' && !isset($_SESSION['id_usuario'])) {
        // Permite obtener el CSRF antes del login, aunque MySQL todavía no esté configurado.
        $datos = Sesion::datos(null);
    } else {
        if ($ruta !== '/api/login' && !isset($_SESSION['id_usuario'])) {
            throw new HttpException(401, 'Inicia sesión para realizar esta operación.');
        }
        $pdo = Conexion::abrir();
        $usuarios = new UsuarioDAO($pdo);
        $datos = match ($ruta) {
            '/api/sesion' => Sesion::datos(Sesion::usuario($usuarios)),
            '/api/login' => (new AuthController($usuarios))->login(),
            '/api/catalogos' => (function () use ($usuarios): array {
                Sesion::usuario($usuarios);
                return ['categorias' => Equipamiento::CATEGORIAS, 'roles' => Usuario::ROLES, 'estados' => Notificacion::ESTADOS];
            })(),
            default => match ($modulo) {
                'usuarios' => (new UsuarioController($pdo, $usuarios))->ejecutar($metodo, $id),
                'equipamientos' => (new EquipamientoController($pdo, $usuarios, new EquipamientoDAO($pdo), new UbicacionDAO($pdo), new HistoricoDAO($pdo)))->ejecutar($metodo, $id, $accion),
                'ubicaciones' => (new UbicacionController($pdo, $usuarios, new UbicacionDAO($pdo)))->ejecutar($metodo, $id),
                'notificaciones' => (new NotificacionController($pdo, $usuarios, new NotificacionDAO($pdo)))->ejecutar($metodo, $id, $accion),
            },
        };
    }
    Respuesta::json(['ok' => true, 'datos' => $datos], $metodo === 'POST' && $modulo !== null ? 201 : 200);
} catch (HttpException $error) {
    Respuesta::json(['ok' => false, 'error' => ['mensaje' => $error->getMessage(), 'detalles' => $error->detalles]], $error->estado);
} catch (PDOException $error) {
    $codigo = (int) ($error->errorInfo[1] ?? 0);
    // Solo traducir restricciones conocidas; otros fallos conservan su carácter de error interno.
    $mensaje = match ($codigo) {
        1062 => 'Ya existe un registro con ese nombre único.',
        1451 => 'No se puede eliminar: hay registros que dependen de este dato.',
        1452 => 'Una referencia ya no existe. Actualiza los datos e inténtalo de nuevo.',
        1644, 3819, 4025 => 'La operación incumple una regla de la base de datos.',
        1205, 1213 => 'Otra operación está modificando esos datos. Inténtalo de nuevo.',
        default => null,
    };
    error_log('Fallo SQL. SQLSTATE=' . $error->getCode() . '; codigo=' . $codigo);
    Respuesta::json(['ok' => false, 'error' => ['mensaje' => $mensaje ?? 'No se pudo completar la operación.']], $mensaje === null ? 500 : 409);
} catch (Throwable $error) {
    error_log('Fallo interno de tipo ' . get_class($error));
    Respuesta::json(['ok' => false, 'error' => ['mensaje' => 'Se ha producido un error interno.']], 500);
}
