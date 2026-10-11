-- ============================================================================
-- RETO 1 MÍO | REGLAS AUTOMÁTICAS DE LA BASE DE DATOS
-- ============================================================================
-- Archivo: 01b_crear_triggers.sql
-- Tipo: DDL de triggers
-- Base de datos: reto_1_mio | Motor: MySQL >= 8.0.16
-- Propósito: Crear los siete triggers de altas, traslados, Almacén y notificaciones.
-- Ejecución: Después de 01 y antes de 02. No repetir si los triggers ya existen.
-- Si ya completaste la instalación anterior, esta reorganización de archivos
-- no requiere ejecutar de nuevo el esquema, los triggers ni los datos.
-- ============================================================================

USE reto_1_mio;
SET NAMES utf8mb4;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY';

DELIMITER $$

-- ----------------------------------------------------------------------------
-- 01 | trg_equipamiento_ubicacion_inicial
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 02 | trg_equipamiento_crear_historico
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_equipamiento_crear_historico
AFTER INSERT ON equipamientos FOR EACH ROW
BEGIN
    INSERT INTO historico_ubicaciones (id_equipamiento, id_ubicacion)
    VALUES (NEW.id_equipamiento, NEW.id_ubicacion_actual);
END$$


-- ----------------------------------------------------------------------------
-- 03 | trg_equipamiento_traslado
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 04 | trg_no_borrar_almacen
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_no_borrar_almacen
BEFORE DELETE ON ubicaciones FOR EACH ROW
BEGIN
    IF OLD.nombre = 'Almacén' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Almacén no puede eliminarse';
    END IF;
END$$


-- ----------------------------------------------------------------------------
-- 05 | trg_no_renombrar_almacen
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_no_renombrar_almacen
BEFORE UPDATE ON ubicaciones FOR EACH ROW
BEGIN
    IF OLD.nombre = 'Almacén' AND BINARY NEW.nombre <> BINARY OLD.nombre THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Almacén no puede renombrarse';
    END IF;
END$$


-- ----------------------------------------------------------------------------
-- 06 | trg_notificacion_solo_user
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 07 | trg_notificacion_no_borrar_realizada
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_notificacion_no_borrar_realizada
BEFORE DELETE ON notificaciones FOR EACH ROW
BEGIN
    IF OLD.estado = 'REALIZADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una notificación REALIZADA no puede eliminarse';
    END IF;
END$$
DELIMITER ;
