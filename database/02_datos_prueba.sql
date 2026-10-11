-- Solo demostración local. Ejecutar UNA VEZ después de 01, con detención al error.
-- Si hay un error, ejecutar ROLLBACK antes de continuar.
USE reto_1_mio;
SET NAMES utf8mb4;
START TRANSACTION;
-- Identidades ficticias; hash bcrypt generado y verificado con PHP.
-- La contraseña de demostración se explica en la guía; nunca usar en producción.
SET @hash_demo = '$2y$12$KtHyVv9xP.gRK7sf1/Wrkuj2AEww78wyqVOaTOzWh4Xp6fQnW2CL.';
INSERT INTO usuarios (nombre, apellidos, nombre_usuario, password_hash, rol) VALUES
('Administrador', 'De demostración', 'admin_demo', @hash_demo, 'ADMIN'),
('Conserje Uno', 'De demostración', 'conserje_demo', @hash_demo, 'USER'),
('Conserje Dos', 'De demostración', 'conserje_dos_demo', @hash_demo, 'USER');
SET @user_uno = (SELECT id_usuario FROM usuarios WHERE nombre_usuario = 'conserje_demo');
SET @user_dos = (SELECT id_usuario FROM usuarios WHERE nombre_usuario = 'conserje_dos_demo');
INSERT INTO ubicaciones (nombre, descripcion) VALUES
('Aula 101', 'Aula de informática de demostración'),
('Aula 102', 'Segunda aula de demostración'),
('Laboratorio', 'Espacio de pruebas de demostración');
SET @almacen = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Almacén');
SET @aula_uno = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Aula 101');
SET @aula_dos = (SELECT id_ubicacion FROM ubicaciones WHERE nombre = 'Aula 102');
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual)
VALUES ('Portátil demo', 'Equipo portátil de prueba', 'Marca demo', 'Modelo P', 'PORTATIL', @almacen);
SET @portatil = LAST_INSERT_ID();
INSERT INTO equipamientos (nombre, descripcion, marca, modelo, categoria, id_ubicacion_actual) VALUES
('Sobremesa demo', 'Ordenador de prueba', 'Marca demo', 'Modelo S', 'SOBREMESA', @almacen),
('Monitor demo', 'Pantalla de prueba', 'Marca demo', 'Modelo M', 'PERIFERICO', @almacen),
('Proyector demo', 'Proyector de prueba', 'Marca demo', 'Modelo A', 'AUDIOVISUAL', @almacen),
('Material demo', 'Equipamiento diverso', 'Marca demo', 'Modelo O', 'OTROS', @almacen);
-- Se trasladan después del alta: Almacén -> Aula 101 -> Aula 102.
UPDATE equipamientos SET id_ubicacion_actual = @aula_uno WHERE id_equipamiento = @portatil;
UPDATE equipamientos SET id_ubicacion_actual = @aula_dos WHERE id_equipamiento = @portatil;
INSERT INTO notificaciones (titulo, descripcion, id_usuario)
VALUES ('Aviso pendiente demo', 'Revisión de un equipo de demostración', @user_uno);
INSERT INTO notificaciones (titulo, descripcion, id_usuario)
VALUES ('Aviso en proceso demo', 'Mantenimiento de demostración', @user_dos);
SET @aviso_proceso = LAST_INSERT_ID();
UPDATE notificaciones SET estado = 'EN_PROCESO' WHERE id_notificacion = @aviso_proceso;
INSERT INTO notificaciones (titulo, descripcion, id_usuario)
VALUES ('Aviso realizado demo', 'Incidencia resuelta de demostración', @user_uno);
SET @aviso_realizado = LAST_INSERT_ID();
UPDATE notificaciones SET estado = 'REALIZADA' WHERE id_notificacion = @aviso_realizado;
COMMIT;
