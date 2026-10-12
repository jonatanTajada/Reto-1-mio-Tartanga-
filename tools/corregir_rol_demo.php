<?php
declare(strict_types=1);
/** Mantenimiento puntual del caso revisado: restablece USER solo en conserje_demo con --aplicar. */
require dirname(__DIR__) . '/app/bootstrap.php';

$pdo = null;
try {
    $pdo = App\Model\Conexion::abrir();
    $consulta = $pdo->prepare('SELECT id_usuario, rol FROM usuarios WHERE nombre_usuario = ?');
    $consulta->execute(['conserje_demo']);
    $cuenta = $consulta->fetch();
    if (!$cuenta) throw new RuntimeException('No existe la cuenta de demostración.');
    echo 'Rol actual de conserje_demo: ' . $cuenta['rol'] . "\n";
    if (!in_array('--aplicar', $argv, true)) {
        echo "Solo lectura. --aplicar restablece el rol original USER de esta cuenta ficticia.\n";
        exit;
    }
    $pdo->beginTransaction();
    $administradores = (new App\Dao\UsuarioDAO($pdo))->bloquearAdministradores();
    $consulta = $pdo->prepare('SELECT rol FROM usuarios WHERE nombre_usuario = ? FOR UPDATE');
    $consulta->execute(['conserje_demo']);
    if ($consulta->fetchColumn() === 'ADMIN' && count($administradores) < 2) {
        throw new RuntimeException('Se debe conservar un administrador.');
    }
    // No cambia contraseña, identidad ni datos de ubicaciones/equipamientos/histórico.
    $consulta = $pdo->prepare('UPDATE usuarios SET rol = ? WHERE nombre_usuario = ?');
    $consulta->execute(['USER', 'conserje_demo']);
    $pdo->commit();
    echo "Rol restablecido a USER. El backend revalida las sesiones en la siguiente petición.\n";
} catch (Throwable $error) {
    if ($pdo?->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, "No se pudo restablecer el rol de demostración; no se confirmó ningún cambio.\n");
    exit(1);
}
