-- Ejecutar sin otras transacciones abiertas, después de 01 (02 es opcional).
-- No conserva filas de prueba. Los AUTO_INCREMENT pueden dejar huecos.
-- Si falla alguna sentencia: detenerse y ejecutar ROLLBACK manualmente.
USE reto_1_mio;
SET NAMES utf8mb4;
START TRANSACTION;
SET @sufijo = REPLACE(UUID(), '-', '');
INSERT INTO ubicaciones (nombre, descripcion) VALUES (CONCAT('Prueba ', @sufijo), 'Destino temporal');
SET @destino = LAST_INSERT_ID();
SET @almacen = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Almacén');
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual)
VALUES ('Equipo temporal', 'Solo para verificar reglas', 'Demo', 'Demo', 'OTROS', @destino);
SET @equipo = LAST_INSERT_ID();
SELECT 'alta_en_almacen' AS prueba,
       IF(id_ubicacion_actual = @almacen, 'PASS', 'FAIL') AS resultado
FROM equipamientos WHERE id_equipamiento = @equipo;
SELECT 'historico_inicial' AS prueba,
       IF(COUNT(*) = 1 AND MIN(id_ubicacion) = @almacen AND COUNT(fecha_fin) = 0, 'PASS', 'FAIL') AS resultado
FROM historico_ubicaciones WHERE id_equipamiento = @equipo;
UPDATE equipamientos SET id_ubicacion_actual = @destino WHERE id_equipamiento = @equipo;
SELECT 'traslado' AS prueba,
       IF(COUNT(*) = 2 AND SUM(fecha_fin IS NULL) = 1, 'PASS', 'FAIL') AS resultado
FROM historico_ubicaciones WHERE id_equipamiento = @equipo;
SELECT 'continuidad' AS prueba,
       IF(cerrado.fecha_fin = abierto.fecha_inicio AND abierto.id_ubicacion = @destino, 'PASS', 'FAIL') AS resultado
FROM historico_ubicaciones cerrado JOIN historico_ubicaciones abierto USING (id_equipamiento)
WHERE cerrado.id_equipamiento = @equipo AND cerrado.fecha_fin IS NOT NULL AND abierto.fecha_fin IS NULL;
UPDATE equipamientos SET nombre = 'Equipo editado', id_ubicacion_actual = @destino
WHERE id_equipamiento = @equipo;
SELECT 'editar_o_repetir_destino_no_crea_intervalo' AS prueba,
       IF(COUNT(*) = 2, 'PASS', 'FAIL') AS resultado
FROM historico_ubicaciones WHERE id_equipamiento = @equipo;
INSERT INTO usuarios (nombre, apellidos, nombre_usuario, password_hash, rol)
VALUES ('Prueba', 'Temporal', CONCAT('test_', @sufijo),
'$2y$12$KtHyVv9xP.gRK7sf1/Wrkuj2AEww78wyqVOaTOzWh4Xp6fQnW2CL.', 'USER');
SET @usuario = LAST_INSERT_ID();
INSERT INTO notificaciones (titulo, descripcion, estado, id_usuario)
VALUES ('Prueba', 'Estado inicial forzado', 'REALIZADA', @usuario);
SET @aviso = LAST_INSERT_ID();
SELECT 'notificacion_inicia_pendiente' AS prueba,
       IF(estado = 'PENDIENTE', 'PASS', 'FAIL') AS resultado
FROM notificaciones WHERE id_notificacion = @aviso;
UPDATE notificaciones SET estado = 'EN_PROCESO' WHERE id_notificacion = @aviso;
DELETE FROM notificaciones WHERE id_notificacion = @aviso;
SELECT 'eliminar_en_proceso' AS prueba, IF(COUNT(*) = 0, 'PASS', 'FAIL') AS resultado
FROM notificaciones WHERE id_notificacion = @aviso;
DELETE FROM equipamientos WHERE id_equipamiento = @equipo;
SELECT 'borrado_equipo_elimina_historico' AS prueba, IF(COUNT(*) = 0, 'PASS', 'FAIL') AS resultado
FROM historico_ubicaciones WHERE id_equipamiento = @equipo;
ROLLBACK;
SELECT 'rollback_sin_filas_de_prueba' AS prueba,
       IF((SELECT COUNT(*) FROM usuarios WHERE id_usuario = @usuario) = 0
          AND (SELECT COUNT(*) FROM ubicaciones WHERE id_ubicacion = @destino) = 0, 'PASS', 'FAIL') AS resultado;
