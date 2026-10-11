<?php
declare(strict_types=1);
namespace App\Http;

use App\Dao\UsuarioDAO;
use App\Exception\HttpException;
use App\Model\Usuario;

/** Sesión por cookie y token CSRF; revalida el usuario contra MySQL en cada operación. */
final class Sesion
{
    public static function iniciar(): void
    {
        $config = require dirname(__DIR__, 2) . '/config/app.php';
        // Los datos privados de sesión quedan dentro del proyecto y fuera del directorio público/Git.
        if (!is_dir($config['session_path']) && !mkdir($config['session_path'], 0700, true) && !is_dir($config['session_path'])) {
            throw new HttpException(503, 'No se pudo preparar el almacenamiento local de sesiones.');
        }
        session_save_path($config['session_path']);
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_name($config['session_name']);
        session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $config['cookie_secure'],
                                  'httponly' => true, 'samesite' => 'Strict']);
        if (!session_start()) {
            throw new HttpException(503, 'No se pudo iniciar la sesión.');
        }
        if (isset($_SESSION['actividad']) && time() - $_SESSION['actividad'] > $config['session_timeout']) {
            self::limpiar();
        }
        $_SESSION['actividad'] = time();
        $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    }

    public static function csrf(): void
    {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) {
            throw new HttpException(403, 'Token CSRF ausente o incorrecto. Solicita una nueva sesión.');
        }
    }

    public static function usuario(UsuarioDAO $dao, ?string $rol = null): array
    {
        if (!isset($_SESSION['id_usuario'])) {
            throw new HttpException(401, 'Inicia sesión para realizar esta operación.');
        }
        $usuario = $dao->buscar($_SESSION['id_usuario']);
        // Cambiar contraseña o borrar la cuenta invalida las sesiones previas.
        if ($usuario === null || !hash_equals($_SESSION['firma'], hash('sha256', $usuario['password_hash']))) {
            self::limpiar();
            throw new HttpException(401, 'La sesión ya no es válida. Inicia sesión de nuevo.');
        }
        if ($rol !== null && $usuario['rol'] !== $rol) {
            throw new HttpException(403, 'Tu rol no permite esta operación.');
        }
        return $usuario;
    }

    public static function autenticar(array $usuario): void
    {
        self::limpiar();
        $_SESSION['id_usuario'] = (int) $usuario['id_usuario'];
        $_SESSION['firma'] = hash('sha256', $usuario['password_hash']);
    }

    public static function limpiar(): void
    {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        $_SESSION['actividad'] = time();
    }

    public static function datos(?array $usuario): array
    {
        return ['usuario' => $usuario === null ? null : Usuario::publico($usuario), 'csrf_token' => $_SESSION['csrf']];
    }
}
