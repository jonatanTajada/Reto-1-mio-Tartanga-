<?php
declare(strict_types=1);
/** Diagnóstico CLI de lectura: roles actuales y sesiones locales, sin exponer cookies ni hashes. */
require dirname(__DIR__) . '/app/bootstrap.php';

try {
    $pdo = App\Model\Conexion::abrir();
    $usuarios = $pdo->query('SELECT id_usuario, nombre_usuario, rol FROM usuarios ORDER BY id_usuario')->fetchAll();
    echo "Cuentas y roles de MySQL:\n";
    foreach ($usuarios as $usuario) {
        echo $usuario['id_usuario'] . ': ' . $usuario['nombre_usuario'] . ' => ' . $usuario['rol'] . "\n";
    }
    $consulta = $pdo->prepare('SELECT id_ubicacion, nombre FROM ubicaciones WHERE nombre = ?');
    $consulta->execute(['I+D+I']);
    echo 'Ubicación I+D+I (solo lectura): ' . json_encode($consulta->fetchAll(), JSON_UNESCAPED_UNICODE) . "\n";
    $archivos = glob(dirname(__DIR__) . '/var/sessions/sess_*') ?: [];
    usort($archivos, fn(string $a, string $b): int => filemtime($b) <=> filemtime($a));
    echo "Últimos cinco archivos de sesión autenticados (no identifican por sí solos el navegador actual):\n";
    $cantidad = 0;
    foreach ($archivos as $archivo) {
        $contenido = file_get_contents($archivo);
        if (!preg_match('/(?:^|;)id_usuario\|i:([0-9]+);/', $contenido, $id)) {
            // Serialización PHP: el separador entre variables puede seguir a una cadena o entero.
            if (!preg_match('/id_usuario\|i:([0-9]+);/', $contenido, $id)) continue;
        }
        $cuenta = array_values(array_filter($usuarios, fn(array $u): bool => (int) $u['id_usuario'] === (int) $id[1]))[0] ?? null;
        echo 'ID ' . $id[1] . '; rol actual ' . ($cuenta['rol'] ?? 'cuenta eliminada') . '; antigüedad ' . (time() - filemtime($archivo)) . " segundos.\n";
        if (++$cantidad === 5) break;
    }
    if (!$cantidad) echo "No hay archivos autenticados disponibles.\n";
    echo "No se ha modificado ningún dato ni ninguna sesión.\n";
} catch (Throwable $error) {
    fwrite(STDERR, "No se pudo completar el diagnóstico local de roles.\n");
    exit(1);
}
