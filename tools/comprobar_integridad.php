<?php
declare(strict_types=1);
/** Comprobación PDO de solo lectura: intervalos, ubicaciones y limpieza de pruebas HTTP. */
require dirname(__DIR__) . '/app/bootstrap.php';

try {
    $pdo = App\Model\Conexion::abrir();
    $consultas = [
        'un_intervalo_abierto_por_equipo' => 'SELECT COUNT(*) FROM (SELECT e.id_equipamiento FROM equipamientos e LEFT JOIN historico_ubicaciones h ON h.id_equipamiento = e.id_equipamiento AND h.fecha_fin IS NULL GROUP BY e.id_equipamiento HAVING COUNT(h.id_historico) <> 1) errores',
        'ubicacion_actual_coincide_con_historico' => 'SELECT COUNT(*) FROM equipamientos e JOIN historico_ubicaciones h ON h.id_equipamiento = e.id_equipamiento AND h.fecha_fin IS NULL WHERE e.id_ubicacion_actual <> h.id_ubicacion',
        'fechas_no_invertidas' => 'SELECT COUNT(*) FROM historico_ubicaciones WHERE fecha_fin < fecha_inicio',
        // LAG compara cada intervalo con su predecesor, incluso si comparten microsegundo.
        'continuidad_de_intervalos' => 'WITH intervalos AS (SELECT id_equipamiento, fecha_inicio, LAG(fecha_fin) OVER (PARTITION BY id_equipamiento ORDER BY fecha_inicio, id_historico) AS fin_anterior, ROW_NUMBER() OVER (PARTITION BY id_equipamiento ORDER BY fecha_inicio, id_historico) AS orden FROM historico_ubicaciones) SELECT COUNT(*) FROM intervalos WHERE orden > 1 AND (fin_anterior IS NULL OR fin_anterior <> fecha_inicio)',
        'sin_usuarios_temporales_http' => "SELECT COUNT(*) FROM usuarios WHERE LEFT(nombre_usuario, 10) = 'http_test_'",
        'sin_ubicaciones_temporales_http' => "SELECT COUNT(*) FROM ubicaciones WHERE LEFT(nombre, 10) = 'http_test_'",
        'sin_equipos_temporales_http' => "SELECT COUNT(*) FROM equipamientos WHERE LEFT(nombre, 10) = 'http_test_'",
        'sin_avisos_temporales_http' => "SELECT COUNT(*) FROM notificaciones WHERE LEFT(titulo, 10) = 'http_test_'",
    ];
    $fallos = 0;
    foreach ($consultas as $nombre => $sql) {
        $errores = (int) $pdo->query($sql)->fetchColumn();
        echo ($errores === 0 ? 'PASS' : 'FAIL') . ": $nombre ($errores inconsistencias)\n";
        $fallos += $errores;
    }
    // Nombres de tabla fijos del programa: no proceden de entradas del usuario.
    foreach (['usuarios', 'ubicaciones', 'equipamientos', 'historico_ubicaciones', 'notificaciones'] as $tabla) {
        echo "$tabla: " . $pdo->query("SELECT COUNT(*) FROM $tabla")->fetchColumn() . " filas.\n";
    }
    exit($fallos === 0 ? 0 : 1);
} catch (Throwable $error) {
    fwrite(STDERR, $error instanceof App\Exception\HttpException ? $error->getMessage() . "\n" : "No se pudo completar la comprobación de integridad.\n");
    exit(1);
}
