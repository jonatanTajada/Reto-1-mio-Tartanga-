<?php
declare(strict_types=1);
namespace App\Model;

/** Valida los datos de usuarios; nunca devuelve el hash en una respuesta pública. */
final class Usuario
{
    public const ROLES = ['ADMIN', 'USER'];

    public static function validar(array $datos, bool $alta): array
    {
        Validacion::campos($datos, ['nombre', 'apellidos', 'nombre_usuario', 'rol', 'password']);
        $resultado = [
            'nombre' => Validacion::texto($datos, 'nombre', 80),
            'apellidos' => Validacion::texto($datos, 'apellidos', 120),
            'nombre_usuario' => Validacion::texto($datos, 'nombre_usuario', 60),
            'rol' => Validacion::opcion($datos, 'rol', self::ROLES),
        ];
        if ($alta || array_key_exists('password', $datos)) {
            $resultado['password_hash'] = password_hash(Validacion::password($datos['password'] ?? null), PASSWORD_BCRYPT);
        }
        return $resultado;
    }

    public static function publico(array $fila): array
    {
        unset($fila['password_hash']);
        return $fila;
    }
}
