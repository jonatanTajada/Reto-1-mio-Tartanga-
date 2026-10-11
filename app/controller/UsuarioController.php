<?php
declare(strict_types=1);
namespace App\Controller;

use App\Dao\UsuarioDAO;
use App\Exception\HttpException;
use App\Http\Peticion;
use App\Http\Sesion;
use App\Model\Usuario;
use PDO;

/** CRUD exclusivo ADMIN; evita que el administrador elimine o degrade su propia cuenta. */
final class UsuarioController
{
    public function __construct(private PDO $pdo, private UsuarioDAO $dao) {}

    public function ejecutar(string $metodo, ?int $id): array
    {
        $actor = Sesion::usuario($this->dao, 'ADMIN');
        if ($metodo === 'GET') {
            return $id === null ? $this->dao->listar() : Usuario::publico($this->exigir($id));
        }
        if ($metodo === 'POST') {
            return Usuario::publico($this->exigir($this->dao->crear(Usuario::validar(Peticion::json(), true))));
        }
        $datos = $metodo === 'PUT' ? Usuario::validar(Peticion::json(), false) : [];
        $this->pdo->beginTransaction();
        try {
            $administradores = $this->dao->bloquearAdministradores();
            $actual = $this->exigir($id, true);
            Sesion::usuario($this->dao, 'ADMIN');
            if ((int) $actor['id_usuario'] === $id && ($metodo === 'DELETE' || $datos['rol'] !== 'ADMIN')) {
                throw new HttpException(409, 'No puedes borrar tu propia cuenta ni quitarte el rol ADMIN.');
            }
            if ($actual['rol'] === 'ADMIN' && count($administradores) <= 1
                && ($metodo === 'DELETE' || $datos['rol'] !== 'ADMIN')) {
                throw new HttpException(409, 'Debe conservarse al menos un administrador.');
            }
            if ($metodo === 'PUT') {
                $this->dao->editar($id, $datos);
                $resultado = Usuario::publico($this->exigir($id));
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
        return $this->dao->buscar($id, $bloquear) ?? throw new HttpException(404, 'No existe ese usuario.');
    }
}
