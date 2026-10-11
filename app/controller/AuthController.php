<?php
declare(strict_types=1);
namespace App\Controller;

use App\Dao\UsuarioDAO;
use App\Exception\HttpException;
use App\Http\Peticion;
use App\Http\Sesion;
use App\Model\Validacion;

/** Login y logout; la respuesta incorrecta no revela si existe el nombre de usuario. */
final class AuthController
{
    public function __construct(private UsuarioDAO $usuarios) {}

    public function login(): array
    {
        $datos = Peticion::json();
        Validacion::campos($datos, ['nombre_usuario', 'password']);
        $login = Validacion::texto($datos, 'nombre_usuario', 60);
        $password = $datos['password'] ?? null;
        if (!is_string($password) || strlen($password) > 72 || str_contains($password, "\0")) {
            throw new HttpException(422, 'La contraseña no tiene un formato válido.');
        }
        // Límite básico por sesión; en despliegue debe añadirse limitación por IP en el servidor.
        $intentos = $_SESSION['login_intentos'] ?? ['inicio' => time(), 'numero' => 0];
        if (time() - $intentos['inicio'] >= 300) {
            $intentos = ['inicio' => time(), 'numero' => 0];
        }
        if ($intentos['numero'] >= 5) {
            throw new HttpException(429, 'Demasiados intentos. Espera cinco minutos.');
        }
        $intentos['numero']++;
        $_SESSION['login_intentos'] = $intentos;
        $usuario = $this->usuarios->porLogin($login);
        // Hash de demostración para mantener el trabajo bcrypt aunque el usuario no exista.
        $hash = $usuario['password_hash'] ?? '$2y$12$KtHyVv9xP.gRK7sf1/Wrkuj2AEww78wyqVOaTOzWh4Xp6fQnW2CL.';
        $correcta = password_verify($password, $hash);
        if (!$correcta || $usuario === null) {
            throw new HttpException(401, 'Usuario o contraseña incorrectos.');
        }
        Sesion::autenticar($usuario);
        return Sesion::datos($usuario);
    }
}
