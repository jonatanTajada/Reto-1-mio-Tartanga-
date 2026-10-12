<?php
declare(strict_types=1);
namespace App\Controller;

use App\Dao\{UbicacionDAO, UsuarioDAO};
use App\Exception\HttpException;
use App\Http\{Peticion, Sesion};
use App\Model\Ubicacion;
use PDO;

/** Lectura compartida y escritura ADMIN; Almacén queda protegido también en la BD. */
final class UbicacionController
{
    public function __construct(private PDO $pdo, private UsuarioDAO $usuarios, private UbicacionDAO $dao) {}

    public function ejecutar(string $metodo, ?int $id): array
    {
        // Consultar una ubicación y trasladar un equipo son acciones distintas.
        // Este permiso usa el rol actual de MySQL, no el nombre de usuario ni un dato del formulario.
        Sesion::usuario($this->usuarios, $metodo === 'GET' ? null : 'ADMIN');
        if ($metodo === 'GET') {
            return $id === null ? $this->dao->listar() : $this->exigir($id);
        }
        if ($metodo === 'POST') {
            return $this->exigir($this->dao->crear(Ubicacion::validar(Peticion::json())));
        }
        $datos = $metodo === 'PUT' ? Ubicacion::validar(Peticion::json()) : [];
        $this->pdo->beginTransaction();
        try {
            $actual = $this->exigir($id, true);
            if ($actual['nombre'] === 'Almacén' && ($metodo === 'DELETE' || $datos['nombre'] !== 'Almacén')) {
                throw new HttpException(409, 'Almacén no se puede borrar ni renombrar.');
            }
            if ($metodo === 'PUT') {
                $this->dao->editar($id, $datos);
                $resultado = $this->exigir($id);
            } else {
                $this->dao->eliminar($id);
                $resultado = ['eliminado' => true];
            }
            $this->pdo->commit();
            return $resultado;
        } catch (\Throwable $error) {
            $this->pdo->rollBack();
            throw $error;
        }
    }

    private function exigir(int $id, bool $bloquear = false): array
    {
        return $this->dao->buscar($id, $bloquear) ?? throw new HttpException(404, 'No existe esa ubicación.');
    }
}
