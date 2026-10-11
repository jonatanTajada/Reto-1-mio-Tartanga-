<?php
declare(strict_types=1);
namespace App\Dao;

use PDO;

/** Consultas preparadas de usuarios; la autorización corresponde al controlador. */
final class UsuarioDAO
{
    public function __construct(private PDO $pdo) {}

    public function listar(): array
    {
        return $this->pdo->query('SELECT id_usuario, nombre, apellidos, nombre_usuario, rol FROM usuarios ORDER BY id_usuario')->fetchAll();
    }

    public function buscar(int $id, bool $bloquear = false): ?array
    {
        $consulta = $this->pdo->prepare('SELECT * FROM usuarios WHERE id_usuario = ?' . ($bloquear ? ' FOR UPDATE' : ''));
        $consulta->execute([$id]);
        return $consulta->fetch() ?: null;
    }

    public function porLogin(string $login): ?array
    {
        $consulta = $this->pdo->prepare('SELECT * FROM usuarios WHERE nombre_usuario = ?');
        $consulta->execute([$login]);
        return $consulta->fetch() ?: null;
    }

    public function crear(array $datos): int
    {
        $consulta = $this->pdo->prepare('INSERT INTO usuarios (nombre, apellidos, nombre_usuario, rol, password_hash) VALUES (:nombre, :apellidos, :nombre_usuario, :rol, :password_hash)');
        $consulta->execute($datos);
        return (int) $this->pdo->lastInsertId();
    }

    public function editar(int $id, array $datos): void
    {
        $password = isset($datos['password_hash']) ? ', password_hash = :password_hash' : '';
        $consulta = $this->pdo->prepare('UPDATE usuarios SET nombre = :nombre, apellidos = :apellidos, nombre_usuario = :nombre_usuario, rol = :rol' . $password . ' WHERE id_usuario = :id');
        $consulta->execute($datos + ['id' => $id]);
    }

    public function eliminar(int $id): void
    {
        $consulta = $this->pdo->prepare('DELETE FROM usuarios WHERE id_usuario = ?');
        $consulta->execute([$id]);
    }

    public function bloquearAdministradores(): array
    {
        // Serializa bajas y cambios de rol para impedir perder el último ADMIN por concurrencia.
        return $this->pdo->query("SELECT id_usuario FROM usuarios WHERE rol = 'ADMIN' ORDER BY id_usuario FOR UPDATE")->fetchAll();
    }
}
