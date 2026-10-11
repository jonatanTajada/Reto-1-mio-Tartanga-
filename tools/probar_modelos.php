<?php
declare(strict_types=1);
/** Pruebas de reglas de entrada sin conexión ni modificaciones de datos. */
require dirname(__DIR__) . '/app/bootstrap.php';

use App\Exception\HttpException;
use App\Model\{Equipamiento, Notificacion, Usuario, Validacion};

$cantidad = 0;
function comprobar(bool $condicion, string $nombre): void
{
    global $cantidad;
    if (!$condicion) {
        throw new RuntimeException('FAIL: ' . $nombre);
    }
    $cantidad++;
    echo "PASS: $nombre\n";
}
function rechazar(callable $accion, string $nombre): void
{
    try {
        $accion();
    } catch (HttpException $error) {
        comprobar($error->estado === 422, $nombre);
        return;
    }
    comprobar(false, $nombre);
}
comprobar(Validacion::texto(['nombre' => '  Áé  '], 'nombre', 2) === 'Áé', 'Texto Unicode y espacios');
rechazar(fn() => Validacion::texto(['nombre' => '   '], 'nombre', 80), 'Rechazar vacío');
rechazar(fn() => Validacion::texto(['nombre' => ['x']], 'nombre', 80), 'Rechazar array');
rechazar(fn() => Validacion::id('1 OR 1=1'), 'Rechazar inyección en ID');
rechazar(fn() => Validacion::id('4294967296'), 'Rechazar ID fuera de rango');
rechazar(fn() => Validacion::password(str_repeat('a', 73)), 'Rechazar truncado bcrypt');
rechazar(fn() => Equipamiento::validar(['id_ubicacion_actual' => 1]), 'Edición no admite ubicación');
rechazar(fn() => Notificacion::validar(['titulo' => 'x', 'descripcion' => 'x', 'estado' => 'REALIZADA']), 'Aviso no admite estado');
rechazar(fn() => Notificacion::validar(['titulo' => 'x', 'descripcion' => str_repeat('á', 32768)]), 'Límite TEXT en bytes');
$usuario = Usuario::validar(['nombre' => 'Prueba', 'apellidos' => 'Ficticios', 'nombre_usuario' => 'test', 'rol' => 'USER', 'password' => 'PruebaLocal2026!'], true);
comprobar(password_verify('PruebaLocal2026!', $usuario['password_hash']), 'Hash verificable');
comprobar(!isset(Usuario::publico($usuario)['password_hash']), 'Hash excluido de respuesta');
echo "$cantidad comprobaciones correctas.\n";
