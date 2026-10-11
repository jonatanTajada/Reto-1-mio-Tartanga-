-- ============================================================================
-- RETO 1 MÍO | COMPROBACIÓN DEL ENTORNO
-- ============================================================================
-- Archivo: 00_comprobar_entorno.sql
-- Tipo: Consultas de lectura
-- Base de datos: reto_1_mio | Motor: MySQL >= 8.0.16
-- Propósito: Consultar versión, cuenta SQL y existencia de reto_1_mio sin cambiar datos.
-- Ejecución: Primer archivo de una instalación nueva. Si la base existe, inspeccionarla y detenerse.
-- Si ya completaste la instalación anterior, esta reorganización de archivos
-- no requiere ejecutar de nuevo el esquema, los triggers ni los datos.
-- ============================================================================

-- PRIMERO: ejecutar en Workbench con tu conexión local. Solo lectura.

-- ----------------------------------------------------------------------------
-- 01 | Servidor y sesión
-- ----------------------------------------------------------------------------
SELECT VERSION() AS version_servidor, CURRENT_USER() AS cuenta_sql,
       @@SESSION.sql_mode AS modo_sql;

-- ----------------------------------------------------------------------------
-- 02 | Existencia de la base y objetos
-- ----------------------------------------------------------------------------
SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'reto_1_mio';
SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'reto_1_mio' ORDER BY TABLE_NAME;
SELECT TRIGGER_NAME FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'reto_1_mio' ORDER BY TRIGGER_NAME;
-- Si la base existe, detenerse e inspeccionarla. No ejecutar 01 automáticamente.
