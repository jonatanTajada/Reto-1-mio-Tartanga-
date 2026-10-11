<?php
declare(strict_types=1);
/** Comprobación CLI de solo lectura: php tools/comprobar_conexion.php. */
require dirname(__DIR__) . '/app/bootstrap.php';
try {
    $pdo = App\Model\Conexion::abrir();
    $base = $pdo->query('SELECT DATABASE()')->fetchColumn();
    echo "Conexión correcta con $base. No se ha modificado ningún dato.\n";
} catch (Throwable $error) {
    fwrite(STDERR, $error instanceof App\Exception\HttpException ? $error->getMessage() . "\n" : "Error interno de configuración.\n");
    exit(1);
}
