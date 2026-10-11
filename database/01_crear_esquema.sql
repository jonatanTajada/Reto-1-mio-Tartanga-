-- Instalación inicial, una sola vez, tras 00_comprobar_entorno.sql.
-- MySQL >= 8.0.16. Activar en Workbench la detención al primer error.
-- Si reto_1_mio ya existe, CREATE DATABASE falla; NO continuar.
SET NAMES utf8mb4;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY';
CREATE DATABASE reto_1_mio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reto_1_mio;

CREATE TABLE usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    nombre_usuario VARCHAR(60) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'USER') NOT NULL,
    CONSTRAINT uq_usuario_nombre UNIQUE (nombre_usuario),
    CONSTRAINT chk_usuario_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) > 0),
    CONSTRAINT chk_usuario_apellidos CHECK (CHAR_LENGTH(TRIM(apellidos)) > 0),
    CONSTRAINT chk_usuario_login CHECK (CHAR_LENGTH(TRIM(nombre_usuario)) > 0),
    CONSTRAINT chk_usuario_hash CHECK (CHAR_LENGTH(TRIM(password_hash)) > 0),
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('ADMIN', 'USER'))
) ENGINE=InnoDB;

CREATE TABLE ubicaciones (
    id_ubicacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT uq_ubicacion_nombre UNIQUE (nombre),
    CONSTRAINT chk_ubicacion_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) > 0),
    CONSTRAINT chk_ubicacion_descripcion CHECK (CHAR_LENGTH(TRIM(descripcion)) > 0)
) ENGINE=InnoDB;

INSERT INTO ubicaciones (nombre, descripcion)
VALUES ('Almacén', 'Ubicación inicial de todos los equipamientos');

CREATE TABLE equipamientos (
    id_equipamiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    categoria ENUM('PORTATIL', 'SOBREMESA', 'PERIFERICO', 'AUDIOVISUAL', 'OTROS') NOT NULL,
    -- El valor se sustituye siempre por Almacén en el BEFORE INSERT.
    -- El DAO proporcionará el ID de Almacén, sin aceptar uno del formulario.
    id_ubicacion_actual INT UNSIGNED NOT NULL,
    CONSTRAINT fk_equipamientos_ubicacion_actual FOREIGN KEY (id_ubicacion_actual)
        REFERENCES ubicaciones(id_ubicacion) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_equipo_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) > 0),
    CONSTRAINT chk_equipo_descripcion CHECK (CHAR_LENGTH(TRIM(descripcion)) > 0),
    CONSTRAINT chk_equipo_marca CHECK (CHAR_LENGTH(TRIM(marca)) > 0),
    CONSTRAINT chk_equipo_modelo CHECK (CHAR_LENGTH(TRIM(modelo)) > 0),
    CONSTRAINT chk_equipo_categoria CHECK (categoria IN ('PORTATIL', 'SOBREMESA', 'PERIFERICO', 'AUDIOVISUAL', 'OTROS')),
    INDEX idx_equipamientos_categoria (categoria),
    INDEX idx_equipamientos_ubicacion_actual (id_ubicacion_actual)
) ENGINE=InnoDB;

CREATE TABLE historico_ubicaciones (
    id_historico BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_equipamiento INT UNSIGNED NOT NULL,
    id_ubicacion INT UNSIGNED NOT NULL,
    fecha_inicio DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_fin DATETIME(6) NULL,
    -- 1 para el intervalo actual; NULL para los cerrados.
    -- UNIQUE admite varios NULL: permite muchos intervalos cerrados y solo uno abierto.
    abierto TINYINT GENERATED ALWAYS AS (CASE WHEN fecha_fin IS NULL THEN 1 ELSE NULL END) STORED,
    CONSTRAINT uq_historico_abierto UNIQUE (id_equipamiento, abierto),
    CONSTRAINT fk_historico_equipamiento FOREIGN KEY (id_equipamiento)
        REFERENCES equipamientos(id_equipamiento) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_historico_ubicacion FOREIGN KEY (id_ubicacion)
        REFERENCES ubicaciones(id_ubicacion) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_historico_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    INDEX idx_historico_equipo_fechas (id_equipamiento, fecha_inicio, id_historico),
    INDEX idx_historico_ubicacion (id_ubicacion)
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
    id_notificacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    estado ENUM('PENDIENTE', 'EN_PROCESO', 'REALIZADA') NOT NULL DEFAULT 'PENDIENTE',
    id_usuario INT UNSIGNED NOT NULL,
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_notificacion_titulo CHECK (CHAR_LENGTH(TRIM(titulo)) > 0),
    CONSTRAINT chk_notificacion_descripcion CHECK (CHAR_LENGTH(TRIM(descripcion)) > 0),
    CONSTRAINT chk_notificacion_estado CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'REALIZADA')),
    INDEX idx_notificaciones_usuario (id_usuario),
    INDEX idx_notificaciones_estado (estado)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_equipamiento_ubicacion_inicial
BEFORE INSERT ON equipamientos FOR EACH ROW
BEGIN
    DECLARE v_almacen INT UNSIGNED DEFAULT NULL;
    SELECT id_ubicacion INTO v_almacen FROM ubicaciones WHERE nombre = 'Almacén';
    IF v_almacen IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe la ubicación obligatoria Almacén';
    END IF;
    SET NEW.id_ubicacion_actual = v_almacen;
END$$

CREATE TRIGGER trg_equipamiento_crear_historico
AFTER INSERT ON equipamientos FOR EACH ROW
BEGIN
    INSERT INTO historico_ubicaciones (id_equipamiento, id_ubicacion)
    VALUES (NEW.id_equipamiento, NEW.id_ubicacion_actual);
END$$

CREATE TRIGGER trg_equipamiento_traslado
AFTER UPDATE ON equipamientos FOR EACH ROW
BEGIN
    DECLARE v_fecha DATETIME(6);
    IF NEW.id_ubicacion_actual <> OLD.id_ubicacion_actual THEN
        -- Una fecha común une ambos intervalos. GREATEST evita fechas invertidas
        -- si el reloj del servidor retrocede respecto al intervalo abierto.
        SELECT GREATEST(CURRENT_TIMESTAMP(6), MAX(fecha_inicio)) INTO v_fecha
        FROM historico_ubicaciones
        WHERE id_equipamiento = OLD.id_equipamiento AND fecha_fin IS NULL;
        IF v_fecha IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El equipamiento no tiene histórico abierto';
        END IF;
        UPDATE historico_ubicaciones SET fecha_fin = v_fecha
        WHERE id_equipamiento = OLD.id_equipamiento AND fecha_fin IS NULL;
        INSERT INTO historico_ubicaciones (id_equipamiento, id_ubicacion, fecha_inicio)
        VALUES (NEW.id_equipamiento, NEW.id_ubicacion_actual, v_fecha);
    END IF;
END$$

CREATE TRIGGER trg_no_borrar_almacen
BEFORE DELETE ON ubicaciones FOR EACH ROW
BEGIN
    IF OLD.nombre = 'Almacén' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Almacén no puede eliminarse';
    END IF;
END$$

CREATE TRIGGER trg_no_renombrar_almacen
BEFORE UPDATE ON ubicaciones FOR EACH ROW
BEGIN
    IF OLD.nombre = 'Almacén' AND BINARY NEW.nombre <> BINARY OLD.nombre THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Almacén no puede renombrarse';
    END IF;
END$$

CREATE TRIGGER trg_notificacion_solo_user
BEFORE INSERT ON notificaciones FOR EACH ROW
BEGIN
    DECLARE v_rol VARCHAR(10) DEFAULT NULL;
    SELECT rol INTO v_rol FROM usuarios WHERE id_usuario = NEW.id_usuario;
    IF v_rol IS NULL OR v_rol <> 'USER' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El creador debe ser un usuario USER existente';
    END IF;
    SET NEW.estado = 'PENDIENTE';
END$$

CREATE TRIGGER trg_notificacion_no_borrar_realizada
BEFORE DELETE ON notificaciones FOR EACH ROW
BEGIN
    IF OLD.estado = 'REALIZADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una notificación REALIZADA no puede eliminarse';
    END IF;
END$$
DELIMITER ;

-- No se crean cuentas SQL ni se conceden permisos globales aquí.
