<?php
declare(strict_types=1);
namespace App\Model;

use App\Exception\HttpException;
use PDO;
use PDOException;

/** Construye una conexión PDO exclusiva para reto_1_mio, sin crear objetos SQL. */
final class Conexion
{
    public static function abrir(): PDO
    {
        $archivo = dirname(__DIR__, 2) . '/config/database.local.php';
        if (!is_file($archivo)) {
            throw new HttpException(503, 'Configura la conexión local a MySQL antes de usar los módulos.');
        }
        $config = require $archivo;
        if (!is_array($config) || ($config['database'] ?? null) !== 'reto_1_mio'
            || !is_string($config['host'] ?? null)
            || !preg_match('/^[a-zA-Z0-9.:-]+$/D', $config['host'])
            || !is_int($config['port'] ?? null) || $config['port'] < 1 || $config['port'] > 65535
            || !is_string($config['username'] ?? null) || !is_string($config['password'] ?? null)) {
            throw new HttpException(503, 'La configuración local de MySQL no es válida.');
        }
        try {
            $pdo = new PDO(
                "mysql:host={$config['host']};port={$config['port']};dbname=reto_1_mio;charset=utf8mb4",
                $config['username'], $config['password'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                 PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                 PDO::ATTR_EMULATE_PREPARES => false,
                 PDO::ATTR_TIMEOUT => 5]
            );
            $pdo->exec("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY'");
            // Conservar la zona del servidor: DATETIME no guarda zona y los datos ya existen.
            return $pdo;
        } catch (PDOException $error) {
            // No registrar DSN, usuario, contraseña ni mensajes del driver que los incluyan.
            error_log('Conexion MySQL rechazada. SQLSTATE: ' . $error->getCode());
            throw new HttpException(503, 'No se pudo conectar con la base de datos. Revisa tu configuración local.');
        }
    }
}
