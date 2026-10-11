-- ============================================================================
-- RETO 1 MÍO | CREACIÓN DEL ESQUEMA
-- ============================================================================
-- Archivo: 01_crear_esquema.sql
-- Tipo: DDL y dato inicial obligatorio
-- Base de datos: reto_1_mio | Motor: MySQL >= 8.0.16
-- Propósito: Crear reto_1_mio, sus cinco tablas, claves, índices y restricciones.
-- Ejecución: Después de 00, solo si la base no existe. Luego ejecutar 01b. No repetir sobre la base creada.
-- Si ya completaste la instalación anterior, esta reorganización de archivos
-- no requiere ejecutar de nuevo el esquema, los triggers ni los datos.
-- ============================================================================

-- Instalación inicial, una sola vez, tras 00_comprobar_entorno.sql.
-- MySQL >= 8.0.16. Activar en Workbench la detención al primer error.
-- Si reto_1_mio ya existe, CREATE DATABASE falla; NO continuar.
SET NAMES utf8mb4;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY';
CREATE DATABASE reto_1_mio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reto_1_mio;


-- ----------------------------------------------------------------------------
-- 01 | Tabla usuarios
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 02 | Tabla ubicaciones
-- ----------------------------------------------------------------------------
CREATE TABLE ubicaciones (
    id_ubicacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT uq_ubicacion_nombre UNIQUE (nombre),
    CONSTRAINT chk_ubicacion_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) > 0),
    CONSTRAINT chk_ubicacion_descripcion CHECK (CHAR_LENGTH(TRIM(descripcion)) > 0)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- Dato de sistema | Almacén obligatorio, independiente de datos demo
-- ----------------------------------------------------------------------------
INSERT INTO ubicaciones (nombre, descripcion)
VALUES ('Almacén', 'Ubicación inicial de todos los equipamientos');


-- ----------------------------------------------------------------------------
-- 03 | Tabla equipamientos
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 04 | Tabla historico_ubicaciones
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 05 | Tabla notificaciones
-- ----------------------------------------------------------------------------
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

-- Fin del esquema. Continuar con 01b_crear_triggers.sql en una instalación nueva.
