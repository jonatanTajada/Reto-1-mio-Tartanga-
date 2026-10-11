<?php
declare(strict_types=1);
namespace App\Model;

/** Expresa la regla de lectura del historial: sus escrituras pertenecen a los triggers. */
final class Historico
{
    public static function publico(array $fila): array
    {
        $fila['actual'] = $fila['fecha_fin'] === null;
        return $fila;
    }
}
