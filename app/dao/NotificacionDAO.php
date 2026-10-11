<?php
declare(strict_types=1);
namespace App\Dao;

use PDO;

/** Persistencia de avisos; filtra por propietario cuando consulta un USER. */
final class NotificacionDAO
{
    public function __construct(private PDO $pdo) {}

    public function listar(?int $usuario): array
    {
        $consulta = $this->pdo->prepare('SELECT n.*, u.nombre_usuario AS creador FROM notificaciones n JOIN usuarios u ON u.id_usuario = n.id_usuario' . ($usuario !== null ? ' WHERE n.id_usuario = ?' : '') . ' ORDER BY n.id_notificacion');
        $consulta->execute($usuario !== null ? [$usuario] : []);
        return $consulta->fetchAll();
    }

    public function buscar(int $id, bool $bloquear = false): ?array
    {
        $consulta = $this->pdo->prepare('SELECT * FROM notificaciones WHERE id_notificacion = ?' . ($bloquear ? ' FOR UPDATE' : ''));
        $consulta->execute([$id]);
        return $consulta->fetch() ?: null;
    }

    public function crear(array $datos, int $usuario): int
    {
        // Autor tomado de la sesión; el trigger comprueba USER y fuerza PENDIENTE.
        $consulta = $this->pdo->prepare('INSERT INTO notificaciones (titulo, descripcion, id_usuario) VALUES (:titulo, :descripcion, :usuario)');
        $consulta->execute($datos + ['usuario' => $usuario]);
        return (int) $this->pdo->lastInsertId();
    }

    public function editar(int $id, array $datos): void
    {
        $consulta = $this->pdo->prepare('UPDATE notificaciones SET titulo = :titulo, descripcion = :descripcion WHERE id_notificacion = :id');
        $consulta->execute($datos + ['id' => $id]);
    }

    public function estado(int $id, string $estado): void
    {
        $consulta = $this->pdo->prepare('UPDATE notificaciones SET estado = ? WHERE id_notificacion = ?');
        $consulta->execute([$estado, $id]);
    }

    public function eliminar(int $id): void
    {
        $consulta = $this->pdo->prepare('DELETE FROM notificaciones WHERE id_notificacion = ?');
        $consulta->execute([$id]);
    }
}
