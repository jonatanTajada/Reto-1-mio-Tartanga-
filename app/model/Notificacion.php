<?php
declare(strict_types=1);
namespace App\Model;

use App\Exception\HttpException;

/** Contenido de avisos; estado y autor quedan fuera del formulario de edición. */
final class Notificacion
{
    public const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'REALIZADA'];

    public static function validar(array $datos): array
    {
        Validacion::campos($datos, ['titulo', 'descripcion']);
        $descripcion = Validacion::texto($datos, 'descripcion', 65535);
        if (strlen($descripcion) > 65535) {
            throw new HttpException(422, 'La descripción supera la capacidad del campo TEXT (65535 bytes).');
        }
        return ['titulo' => Validacion::texto($datos, 'titulo', 150), 'descripcion' => $descripcion];
    }
}
