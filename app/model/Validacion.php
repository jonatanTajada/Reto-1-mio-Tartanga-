<?php
declare(strict_types=1);
namespace App\Model;

use App\Exception\HttpException;

/** Reglas comunes de entrada; rechaza campos inesperados para evitar cambios de permisos. */
final class Validacion
{
    public static function campos(array $datos, array $permitidos): void
    {
        if (array_diff(array_keys($datos), $permitidos)) {
            throw new HttpException(422, 'Hay campos que esta operación no admite.');
        }
    }

    public static function texto(array $datos, string $campo, int $maximo): string
    {
        $valor = $datos[$campo] ?? null;
        if (!is_string($valor) || !preg_match('//u', $valor)) {
            throw new HttpException(422, "El campo $campo debe ser texto UTF-8.");
        }
        $valor = trim($valor);
        $longitud = preg_match_all('/./us', $valor);
        if ($valor === '' || $longitud > $maximo || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $valor)) {
            throw new HttpException(422, "El campo $campo es obligatorio y admite hasta $maximo caracteres.");
        }
        return $valor;
    }

    public static function opcion(array $datos, string $campo, array $opciones): string
    {
        if (!is_string($datos[$campo] ?? null) || !in_array($datos[$campo], $opciones, true)) {
            throw new HttpException(422, "El campo $campo tiene un valor no permitido.", [$campo => $opciones]);
        }
        return $datos[$campo];
    }

    public static function id(mixed $valor): int
    {
        if ((!is_string($valor) && !is_int($valor)) || !preg_match('/^[1-9][0-9]{0,9}$/D', (string) $valor)
            || (int) $valor > 4294967295) {
            throw new HttpException(422, 'El identificador debe ser un entero positivo válido.');
        }
        return (int) $valor;
    }

    public static function password(mixed $valor): string
    {
        // bcrypt solo procesa 72 bytes: rechazar más evita contraseñas truncadas silenciosamente.
        if (!is_string($valor) || strlen($valor) < 12 || strlen($valor) > 72 || str_contains($valor, "\0")) {
            throw new HttpException(422, 'La contraseña debe tener entre 12 y 72 bytes y no contener caracteres nulos.');
        }
        return $valor;
    }
}
