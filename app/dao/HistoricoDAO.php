<?php
declare(strict_types=1);
namespace App\Dao;

use PDO;
use App\Model\Historico;

/** Consulta ordenada de intervalos; deliberadamente no ofrece métodos de escritura. */
final class HistoricoDAO
{
    public function __construct(private PDO $pdo) {}

    public function porEquipamiento(int $id): array
    {
        $consulta = $this->pdo->prepare('SELECT h.id_historico, h.id_equipamiento, h.id_ubicacion, u.nombre AS ubicacion, h.fecha_inicio, h.fecha_fin FROM historico_ubicaciones h JOIN ubicaciones u ON u.id_ubicacion = h.id_ubicacion WHERE h.id_equipamiento = ? ORDER BY h.fecha_inicio, h.id_historico');
        $consulta->execute([$id]);
        return array_map([Historico::class, 'publico'], $consulta->fetchAll());
    }
}
