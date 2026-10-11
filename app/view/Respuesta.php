<?php
declare(strict_types=1);
namespace App\View;

/** Vista del backend: transforma datos en JSON, sin consultas ni reglas de permisos. */
final class Respuesta
{
    public static function json(array $contenido, int $estado = 200): void
    {
        http_response_code($estado);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($contenido, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }
}
