<?php
declare(strict_types=1);
namespace App\Http;

use App\Exception\HttpException;

/** Lee cuerpos JSON limitados; no mezcla formularios, cookies y parámetros de entrada. */
final class Peticion
{
    public static function json(): array
    {
        if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
            throw new HttpException(415, 'Envía el cuerpo como application/json.');
        }
        $contenido = file_get_contents('php://input', false, null, 0, 65537);
        if ($contenido === false || strlen($contenido) > 65536) {
            throw new HttpException(413, 'El cuerpo de la petición es demasiado grande.');
        }
        try {
            $objeto = json_decode($contenido, false, 32, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new HttpException(400, 'El cuerpo no contiene JSON válido.');
        }
        if (!$objeto instanceof \stdClass) {
            throw new HttpException(400, 'El cuerpo debe ser un objeto JSON.');
        }
        return (array) $objeto;
    }
}
