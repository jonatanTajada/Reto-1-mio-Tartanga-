<?php
declare(strict_types=1);
namespace App\Dao;

use PDO;

/** Acceso a ubicaciones; las FK y los triggers protegen referencias y Almacén. */
final class UbicacionDAO
{
    public function __construct(private PDO $pdo) {}

    public function listar(): array
    {
        return $this->pdo->query('SELECT * FROM ubicaciones ORDER BY id_ubicacion')->fetchAll();
    }

    public function buscar(int $id, bool $bloquear = false): ?array
    {
        $consulta = $this->pdo->prepare('SELECT * FROM ubicaciones WHERE id_ubicacion = ?' . ($bloquear ? ' FOR UPDATE' : ''));
        $consulta->execute([$id]);
        return $consulta->fetch() ?: null;
    }

    public function crear(array $datos): int
    {
        $consulta = $this->pdo->prepare('INSERT INTO ubicaciones (nombre, descripcion) VALUES (:nombre, :descripcion)');
        $consulta->execute($datos);
        return (int) $this->pdo->lastInsertId();
    }

    public function editar(int $id, array $datos): void
    {
        $consulta = $this->pdo->prepare('UPDATE ubicaciones SET nombre = :nombre, descripcion = :descripcion WHERE id_ubicacion = :id');
        $consulta->execute($datos + ['id' => $id]);
    }

    public function eliminar(int $id): void
    {
        $consulta = $this->pdo->prepare('DELETE FROM ubicaciones WHERE id_ubicacion = ?');
        $consulta->execute([$id]);
    }
}
