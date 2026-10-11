-- Casos independientes, comentados para no ejecutar errores deliberados en lote.
-- Copiar cada bloque SIN los delimitadores /* */ a una pestaña de Workbench.
-- Ejecutar hasta la sentencia que debe fallar; después ejecutar ROLLBACK por separado.
-- No ejecutar con otra transacción abierta. Exclusivamente reto_1_mio.

/*
USE reto_1_mio;
START TRANSACTION;
DELETE FROM ubicaciones WHERE nombre = 'Almacén';
-- Esperado: error 1644 / SQLSTATE 45000. Almacén sigue existiendo.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
UPDATE ubicaciones SET nombre = 'Otro almacén' WHERE nombre = 'Almacén';
-- Esperado: error 1644. El nombre no cambia.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
SET @almacen = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Almacén');
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual)
VALUES ('Prueba', 'Prueba', 'Demo', 'Demo', 'OTROS', @almacen);
SET @equipo = LAST_INSERT_ID();
INSERT INTO historico_ubicaciones (id_equipamiento, id_ubicacion) VALUES (@equipo, @almacen);
-- Esperado: error 1062, UNIQUE impide dos intervalos abiertos.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
SET @almacen = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Almacén');
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual)
VALUES ('Prueba', 'Prueba', 'Demo', 'Demo', 'OTROS', @almacen);
SET @equipo = LAST_INSERT_ID();
UPDATE historico_ubicaciones SET fecha_fin = DATE_SUB(fecha_inicio, INTERVAL 1 SECOND)
WHERE id_equipamiento = @equipo;
-- Esperado: error 3819, CHECK de fechas.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
SET @almacen = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Almacén');
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual)
VALUES ('   ', 'Prueba', 'Demo', 'Demo', 'OTROS', @almacen);
-- Esperado: error 3819, nombre vacío después de TRIM.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
INSERT INTO usuarios (nombre, apellidos, nombre_usuario, password_hash, rol)
VALUES ('Prueba', 'Temporal', CONCAT('test_', REPLACE(UUID(), '-', '')),
'$2y$12$KtHyVv9xP.gRK7sf1/Wrkuj2AEww78wyqVOaTOzWh4Xp6fQnW2CL.', 'ADMIN');
SET @admin = LAST_INSERT_ID();
INSERT INTO notificaciones (titulo, descripcion, id_usuario) VALUES ('Prueba', 'Prueba', @admin);
-- Esperado: error 1644, ADMIN no puede ser creador.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
INSERT INTO usuarios (nombre, apellidos, nombre_usuario, password_hash, rol)
VALUES ('Prueba', 'Temporal', CONCAT('test_', REPLACE(UUID(), '-', '')),
'$2y$12$KtHyVv9xP.gRK7sf1/Wrkuj2AEww78wyqVOaTOzWh4Xp6fQnW2CL.', 'USER');
SET @usuario = LAST_INSERT_ID();
INSERT INTO notificaciones (titulo, descripcion, id_usuario) VALUES ('Prueba', 'Prueba', @usuario);
SET @aviso = LAST_INSERT_ID();
UPDATE notificaciones SET estado = 'REALIZADA' WHERE id_notificacion = @aviso;
DELETE FROM notificaciones WHERE id_notificacion = @aviso;
-- Esperado: error 1644, REALIZADA no puede eliminarse.
ROLLBACK;
*/

/*
USE reto_1_mio;
START TRANSACTION;
INSERT INTO ubicaciones (nombre, descripcion) VALUES (CONCAT('test_', UUID()), 'Temporal');
SET @destino = LAST_INSERT_ID();
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual)
VALUES ('Prueba', 'Prueba', 'Demo', 'Demo', 'OTROS', @destino);
SET @equipo = LAST_INSERT_ID();
UPDATE equipamientos SET id_ubicacion_actual = @destino WHERE id_equipamiento = @equipo;
DELETE FROM ubicaciones WHERE id_ubicacion = @destino;
-- Esperado: error 1451, ubicación referenciada.
ROLLBACK;
*/
