-- PRIMERO: ejecutar en Workbench con tu conexión local. Solo lectura.
SELECT VERSION() AS version_servidor, CURRENT_USER() AS cuenta_sql,
       @@SESSION.sql_mode AS modo_sql;
SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'reto_1_mio';
SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'reto_1_mio' ORDER BY TABLE_NAME;
SELECT TRIGGER_NAME FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'reto_1_mio' ORDER BY TRIGGER_NAME;
-- Si la base existe, detenerse e inspeccionarla. No ejecutar 01 automáticamente.
