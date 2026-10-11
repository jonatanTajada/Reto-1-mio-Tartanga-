# Workbench y comprobaciones

## Estado de las comprobaciones

Revisión del 11/10/2026:

- Cliente detectado: MySQL 8.0.43 para Windows.
- Servicio MySQL80: Running.
- Intento TCP a 127.0.0.1:3306 con root sin contraseña: error 1045, acceso denegado.
- Intento con la configuración disponible del cliente: error 1045, cuenta ODBC sin contraseña.
- No se probaron contraseñas ni se modificó autenticación. No se conocen existencia ni contenido de `reto_1_mio`.
- Ninguna sentencia de creación, inserción o prueba se ha enviado al servidor.
- Hash demo generado con PHP y verificado mediante password_verify: true.
- Esquema revisado estáticamente; esta revisión no acredita que MySQL lo acepte.

## 1. Abrir la conexión y comprobar el entorno

Usa tu conexión local guardada en Workbench. Introduce la contraseña en su diálogo local; no la copies en el chat ni la guardes en SQL publicado.

Abrir **`database/00_comprobar_entorno.sql` primero** y ejecutar sus consultas. Verificar versión de servidor >= 8.0.16 (el número del cliente no demuestra la versión del servidor), modo SQL, existencia, tablas y triggers de reto_1_mio. La consulta solo filtra esta base.

Si la base existe, detenerse. Para conocer sus filas, ejecutar SELECT COUNT(*) de las tablas que aparezcan, sin alterar nada. La instalación inicial no se ejecuta sobre una base existente, aunque parezca vacía; acordar primero cómo continuar. No utilizar los scripts originales de `Documentacion/DB`.

## 2. Instalación nueva

En Workbench, activar la opción **Stop Script Execution On Errors**. Abrir `01_crear_esquema.sql` como script SQL y ejecutarlo completo, respetando DELIMITER. Se necesita una cuenta con permisos para crear la base, tablas, índices y triggers; algunos servidores con binlog imponen permisos adicionales para triggers. No cambiar ajustes globales para evitar errores.

Esperado: cinco tablas y siete triggers. Si hay un error, detenerse y conservar el mensaje y el estado parcial. CREATE DATABASE y CREATE TABLE implican commits; no se promete ROLLBACK de toda la instalación. No reejecutar ignorando errores ni borrar objetos automáticamente.

Después abrir `02_datos_prueba.sql`, una sola vez. Usa una transacción: si falla, ejecutar ROLLBACK inmediatamente, en esa misma conexión, antes de continuar. No ejecutar COMMIT tras errores. Repetirlo producirá duplicados en claves únicas; no usa INSERT IGNORE ni sobrescribe filas existentes.

## 3. Inspección de lectura

Ejecutar `03_consultas_comprobacion.sql`.

| Comprobación | Resultado esperado en instalación nueva + 02 |
|---|---|
| Tablas / triggers | 5 / 7 |
| usuarios / ubicaciones / equipos / histórico / avisos | 3 / 4 / 5 / 7 / 3 |
| Roles | Un ADMIN y dos USER |
| Categorías | Un equipo por cada una de las cinco |
| Portátil | Ubicación actual Aula 102 |
| Recorrido del portátil | Almacén → Aula 101 → Aula 102; último fin NULL |
| Avisos | Uno PENDIENTE, uno EN_PROCESO, uno REALIZADA |
| Consultas de inconsistencias al final | Cuatro resultados sin filas |

Los resultados esperados no son resultados ejecutados. Si ya existen datos adicionales los recuentos globales cambian; no eliminarlos para alcanzar estos valores.

## 4. Comportamientos permitidos

`04_pruebas_transaccionales.sql` crea fixtures con nombres UUID, comprueba nueve resultados PASS y ejecuta ROLLBACK. Puede ejecutarse antes o después de los datos demo. No usar si tienes otra transacción abierta: START TRANSACTION podría cerrar la anterior.

Verifica: alta forzada en Almacén, histórico inicial, traslado, continuidad de fechas, edición sin nuevos intervalos, estado inicial PENDIENTE, borrado EN_PROCESO, cascada al borrar equipo y ausencia de filas tras rollback. Si aparece FAIL o una sentencia falla, no considerar la prueba superada; ejecutar ROLLBACK y revisar.

AUTO_INCREMENT puede avanzar pese al rollback. Los huecos son normales; no renumerar IDs. Este script verifica reglas SQL, no que un usuario HTTP tenga permisos.

## 5. Rechazos esperados

`05_pruebas_rechazo_manual.sql` contiene ocho bloques comentados. Copiar **un bloque sin `/* */`** a una pestaña, ejecutar sus preparativos, después la sentencia de rechazo, y finalmente ROLLBACK de forma explícita. No ejecutar todos los bloques como un lote. Ejecutar el fichero tal cual no realiza las pruebas.

| Caso | Error esperado |
|---|---|
| Borrar o renombrar Almacén | 1644 / SQLSTATE 45000 |
| Insertar segundo intervalo abierto | 1062 / clave duplicada |
| Fecha fin anterior al inicio | 3819 / CHECK |
| Nombre de equipamiento vacío | 3819 / CHECK |
| Crear notificación con autor ADMIN | 1644 |
| Borrar notificación REALIZADA | 1644 |
| Borrar ubicación referenciada | 1451 / clave foránea |

Al ver el error esperado, comprobar que la fila afectada sigue intacta y ejecutar ROLLBACK. Un error distinto no acredita el caso.

## 6. Pendientes del backend y concurrencia

- Comprobar permisos ADMIN/USER con peticiones HTTP, incluidos intentos de editar campos prohibidos y avisos ajenos.
- Configurar PDO, consultas preparadas, CSRF, sesiones y tratamiento de errores.
- Usar una cuenta de runtime con SELECT sobre histórico; sin escritura directa. Los triggers se crean con un definidor autorizado que mantenga los privilegios necesarios. No borrar esa cuenta sin planificarlo.
- Probar traslados del mismo equipo en dos sesiones MySQL concurrentes. Las actualizaciones de la misma fila se serializan en InnoDB, pero todavía no se ha probado aquí. El índice único protege duplicados abiertos, no demuestra todos los flujos concurrentes.
- Evitar cambios de ID: RESTRICT no equivale a inmovilidad absoluta de una clave sin referencias; el backend no ofrecerá edición de IDs.

## 7. Registrar evidencias

Anotar versión de servidor, fecha, script, PASS/FAIL o error esperado, y cualquier incidencia en esta guía. No guardar contraseñas, hashes completos de usuarios reales ni pantallazos con datos privados. Actualizar README y plan solo con resultados realmente ejecutados.

Validaciones automáticas del bloque: conservación SHA-256 de los originales, aislamiento de scripts a reto_1_mio, recuento de tablas/triggers, ausencia de borrados de bases y resolución de enlaces Markdown. Su informe está en [VALIDACION_ESTATICA.md](VALIDACION_ESTATICA.md).
