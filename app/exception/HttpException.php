<?php
declare(strict_types=1);
namespace App\Exception;
use RuntimeException;

/** Un único error controlado con código HTTP y detalles seguros de validación. */
final class HttpException extends RuntimeException
{
    public function __construct(public readonly int $estado, string $mensaje, public readonly array $detalles = [])
    {
        parent::__construct($mensaje);
    }
}
