<?php
declare(strict_types=1);
namespace App\Controller;

use App\Dao\{EquipamientoDAO, HistoricoDAO, UbicacionDAO, UsuarioDAO};
use App\Exception\HttpException;
use App\Http\{Peticion, Sesion};
use App\Model\{Equipamiento, Validacion};
use PDO;

/** Distingue edición ADMIN y traslado USER; ambos roles consultan inventario e historial. */
final class EquipamientoController
{
    public function __construct(private PDO $pdo, private UsuarioDAO $usuarios, private EquipamientoDAO $dao,
                                private UbicacionDAO $ubicaciones, private HistoricoDAO $historico) {}

    public function ejecutar(string $metodo, ?int $id, ?string $accion): array
    {
        Sesion::usuario($this->usuarios, $metodo === 'GET' ? null : ($accion === 'ubicacion' ? 'USER' : 'ADMIN'));
        if ($metodo === 'GET') {
            if ($id !== null) {
                $equipo = $this->exigir($id);
                return $accion === 'historial' ? $this->historico->porEquipamiento($id) : $equipo;
            }
            Validacion::campos($_GET, ['categoria']);
            $categoria = isset($_GET['categoria']) ? Validacion::opcion($_GET, 'categoria', Equipamiento::CATEGORIAS) : null;
            return $this->dao->listar($categoria);
        }
        if ($metodo === 'POST') {
            return $this->exigir($this->dao->crear(Equipamiento::validar(Peticion::json())));
        }
        $datos = $metodo === 'DELETE' ? [] : Peticion::json();
        if ($accion === 'ubicacion') {
            Validacion::campos($datos, ['id_ubicacion']);
            $destino = Validacion::id($datos['id_ubicacion'] ?? null);
        } elseif ($metodo === 'PUT') {
            $datos = Equipamiento::validar($datos);
        }
        $this->pdo->beginTransaction();
        try {
            $this->exigir($id, true);
            if ($accion === 'ubicacion') {
                if ($this->ubicaciones->buscar($destino) === null) {
                    throw new HttpException(404, 'No existe la ubicación de destino.');
                }
                $this->dao->trasladar($id, $destino);
            } elseif ($metodo === 'PUT') {
                $this->dao->editar($id, $datos);
            } else {
                $this->dao->eliminar($id);
            }
            $resultado = $metodo === 'DELETE' ? ['eliminado' => true] : $this->exigir($id);
            $this->pdo->commit();
            return $resultado;
        } catch (\Throwable $error) {
            $this->pdo->rollBack();
            throw $error;
        }
    }

    private function exigir(int $id, bool $bloquear = false): array
    {
        return $this->dao->buscar($id, $bloquear) ?? throw new HttpException(404, 'No existe ese equipamiento.');
    }
}
