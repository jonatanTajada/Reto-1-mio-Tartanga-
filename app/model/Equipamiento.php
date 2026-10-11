<?php
declare(strict_types=1);
namespace App\Model;

/** Datos del equipamiento; la ubicación se valida en una operación independiente. */
final class Equipamiento
{
    public const CATEGORIAS = ['PORTATIL', 'SOBREMESA', 'PERIFERICO', 'AUDIOVISUAL', 'OTROS'];

    public static function validar(array $datos): array
    {
        Validacion::campos($datos, ['nombre', 'descripcion', 'marca', 'modelo', 'categoria']);
        return [
            'nombre' => Validacion::texto($datos, 'nombre', 120),
            'descripcion' => Validacion::texto($datos, 'descripcion', 255),
            'marca' => Validacion::texto($datos, 'marca', 100),
            'modelo' => Validacion::texto($datos, 'modelo', 100),
            'categoria' => Validacion::opcion($datos, 'categoria', self::CATEGORIAS),
        ];
    }
}
