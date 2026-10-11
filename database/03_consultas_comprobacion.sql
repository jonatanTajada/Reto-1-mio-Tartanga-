-- ============================================================================
-- RETO 1 MÍO | CONSULTAS DE COMPROBACIÓN
-- ============================================================================
-- Archivo: 03_consultas_comprobacion.sql
-- Tipo: Consultas de lectura
-- Base de datos: reto_1_mio | Motor: MySQL >= 8.0.16
-- Propósito: Inspeccionar tablas, triggers, inventario e integridad del histórico.
-- Ejecución: Después de cargar los datos. No altera filas; se puede repetir.
-- Si ya completaste la instalación anterior, esta reorganización de archivos
-- no requiere ejecutar de nuevo el esquema, los triggers ni los datos.
-- ============================================================================

-- Solo lectura; no muestra hashes de contraseñas.
USE reto_1_mio;

-- ----------------------------------------------------------------------------
-- 01 | Estructura y recuentos
-- ----------------------------------------------------------------------------
SHOW TABLES;
SHOW TRIGGERS;
SELECT 'usuarios' AS tabla, COUNT(*) AS filas FROM usuarios
UNION ALL SELECT 'ubicaciones', COUNT(*) FROM ubicaciones
UNION ALL SELECT 'equipamientos', COUNT(*) FROM equipamientos
UNION ALL SELECT 'historico_ubicaciones', COUNT(*) FROM historico_ubicaciones
UNION ALL SELECT 'notificaciones', COUNT(*) FROM notificaciones;
-- En instalación nueva + datos demo: 3, 4, 5, 7, 3 filas, respectivamente.

-- ----------------------------------------------------------------------------
-- 02 | Contenido e inventario
-- ----------------------------------------------------------------------------
SELECT id_usuario, nombre_usuario, rol FROM usuarios ORDER BY id_usuario;
SELECT e.id_equipamiento, e.nombre, e.marca, e.modelo, e.categoria,
       u.nombre AS ubicacion_actual
FROM equipamientos e JOIN ubicaciones u ON u.id_ubicacion = e.id_ubicacion_actual
ORDER BY e.id_equipamiento;
SELECT e.nombre, u.nombre AS ubicacion, h.fecha_inicio, h.fecha_fin
FROM historico_ubicaciones h JOIN equipamientos e USING (id_equipamiento)
JOIN ubicaciones u USING (id_ubicacion)
ORDER BY e.id_equipamiento, h.fecha_inicio, h.id_historico;
SELECT n.titulo, n.estado, u.nombre_usuario AS creador
FROM notificaciones n JOIN usuarios u USING (id_usuario)
ORDER BY n.id_notificacion;
SELECT * FROM equipamientos WHERE categoria = 'PORTATIL';

-- ----------------------------------------------------------------------------
-- 03 | Integridad: cuatro resultados sin filas
-- ----------------------------------------------------------------------------
-- Las cuatro consultas siguientes deben devolver CERO filas.
SELECT e.id_equipamiento, COUNT(h.id_historico) AS abiertos
FROM equipamientos e LEFT JOIN historico_ubicaciones h
ON h.id_equipamiento = e.id_equipamiento AND h.fecha_fin IS NULL
GROUP BY e.id_equipamiento HAVING COUNT(h.id_historico) <> 1;
SELECT e.id_equipamiento FROM equipamientos e JOIN historico_ubicaciones h
ON h.id_equipamiento = e.id_equipamiento AND h.fecha_fin IS NULL
WHERE e.id_ubicacion_actual <> h.id_ubicacion;
SELECT id_historico FROM historico_ubicaciones WHERE fecha_fin < fecha_inicio;
WITH intervalos AS (
    SELECT id_historico, id_equipamiento, fecha_inicio,
           LAG(fecha_fin) OVER (PARTITION BY id_equipamiento ORDER BY fecha_inicio, id_historico) AS fin_anterior,
           ROW_NUMBER() OVER (PARTITION BY id_equipamiento ORDER BY fecha_inicio, id_historico) AS posicion
    FROM historico_ubicaciones
)
SELECT * FROM intervalos WHERE posicion > 1 AND NOT (fecha_inicio <=> fin_anterior);
