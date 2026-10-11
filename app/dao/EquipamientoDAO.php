<?php
declare(strict_types=1);
namespace App\Dao;

use PDO;

/** Inventario y traslados; no inserta ni cierra intervalos del histórico en PHP. */
final class EquipamientoDAO
{
    public function __construct(private PDO $pdo) {}

    public function listar(?string $categoria): array
    {
        $sql = 'SELECT e.*, u.nombre AS ubicacion_actual FROM equipamientos e JOIN ubicaciones u ON u.id_ubicacion = e.id_ubicacion_actual';
        $consulta = $this->pdo->prepare($sql . ($categoria !== null ? ' WHERE e.categoria = ?' : '') . ' ORDER BY e.id_equipamiento');
        $consulta->execute($categoria !== null ? [$categoria] : []);
        return $consulta->fetchAll();
    }

    public function buscar(int $id, bool $bloquear = false): ?array
    {
        $consulta = $this->pdo->prepare('SELECT * FROM equipamientos WHERE id_equipamiento = ?' . ($bloquear ? ' FOR UPDATE' : ''));
        $consulta->execute([$id]);
        return $consulta->fetch() ?: null;
    }

    public function crear(array $datos): int
    {
        // El ID se obtiene de la BD; el trigger fuerza Almacén y crea el historial inicial.
        $consulta = $this->pdo->prepare("INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual) SELECT :nombre, :descripcion, :marca, :modelo, :categoria, id_ubicacion FROM ubicaciones WHERE nombre = 'Almacén'");
        $consulta->execute($datos);
        if ($consulta->rowCount() !== 1) {
            throw new \App\Exception\HttpException(409, 'Falta la ubicación obligatoria Almacén.');
        }
        return (int) $this->pdo->lastInsertId();
    }

    public function editar(int $id, array $datos): void
    {
        $consulta = $this->pdo->prepare('UPDATE equipamientos SET nombre = :nombre, descripcion = :descripcion, marca = :marca, modelo = :modelo, categoria = :categoria WHERE id_equipamiento = :id');
        $consulta->execute($datos + ['id' => $id]);
    }

    public function trasladar(int $id, int $ubicacion): void
    {
        // Una sola sentencia: el trigger conserva la continuidad del histórico en la misma transacción.
        $consulta = $this->pdo->prepare('UPDATE equipamientos SET id_ubicacion_actual = ? WHERE id_equipamiento = ?');
        $consulta->execute([$ubicacion, $id]);
    }

    public function eliminar(int $id): void
    {
        $consulta = $this->pdo->prepare('DELETE FROM equipamientos WHERE id_equipamiento = ?');
        $consulta->execute([$id]);
    }
}
