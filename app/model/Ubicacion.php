<?php
declare(strict_types=1);
namespace App\Model;

/** Representa y valida una ubicación del centro. */
final class Ubicacion
{
    public static function validar(array $datos): array
    {
        Validacion::campos($datos, ['nombre', 'descripcion']);
        return ['nombre' => Validacion::texto($datos, 'nombre', 100),
                'descripcion' => Validacion::texto($datos, 'descripcion', 255)];
    }
}
