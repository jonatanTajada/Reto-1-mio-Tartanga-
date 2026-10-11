<?php
declare(strict_types=1);
namespace App\Controller;

use App\Dao\{NotificacionDAO, UsuarioDAO};
use App\Exception\HttpException;
use App\Http\{Peticion, Sesion};
use App\Model\{Notificacion, Validacion};
use PDO;

/** USER gestiona sus avisos; ADMIN consulta todos y cambia únicamente su estado. */
final class NotificacionController
{
    public function __construct(private PDO $pdo, private UsuarioDAO $usuarios, private NotificacionDAO $dao) {}

    public function ejecutar(string $metodo, ?int $id, ?string $accion): array
    {
        $actor = Sesion::usuario($this->usuarios, $metodo === 'GET' ? null : ($accion === 'estado' ? 'ADMIN' : 'USER'));
        if ($metodo === 'GET') {
            if ($id === null) {
                return $this->dao->listar($actor['rol'] === 'USER' ? (int) $actor['id_usuario'] : null);
            }
            return $this->exigir($id, $actor);
        }
        if ($metodo === 'POST') {
            return $this->exigir($this->dao->crear(Notificacion::validar(Peticion::json()), (int) $actor['id_usuario']), $actor);
        }
        $datos = $metodo === 'DELETE' ? [] : Peticion::json();
        if ($accion === 'estado') {
            Validacion::campos($datos, ['estado']);
            $estado = Validacion::opcion($datos, 'estado', Notificacion::ESTADOS);
        } elseif ($metodo === 'PUT') {
            $datos = Notificacion::validar($datos);
        }
        $this->pdo->beginTransaction();
        try {
            // Bloquear la fila evita borrar mientras otra petición cambia a REALIZADA.
            $actual = $this->exigir($id, $actor, true);
            if ($accion === 'estado') {
                $this->dao->estado($id, $estado);
            } elseif ($metodo === 'PUT') {
                $this->dao->editar($id, $datos);
            } else {
                if ($actual['estado'] === 'REALIZADA') {
                    throw new HttpException(409, 'Una notificación realizada no se puede eliminar.');
                }
                $this->dao->eliminar($id);
            }
            $resultado = $metodo === 'DELETE' ? ['eliminado' => true] : $this->exigir($id, $actor);
            $this->pdo->commit();
            return $resultado;
        } catch (\Throwable $error) {
            $this->pdo->rollBack();
            throw $error;
        }
    }

    private function exigir(int $id, array $actor, bool $bloquear = false): array
    {
        $fila = $this->dao->buscar($id, $bloquear);
        // 404 evita revelar a otro USER la existencia de avisos ajenos.
        if ($fila === null || ($actor['rol'] === 'USER' && (int) $fila['id_usuario'] !== (int) $actor['id_usuario'])) {
            throw new HttpException(404, 'No existe una notificación accesible con ese identificador.');
        }
        return $fila;
    }
}
