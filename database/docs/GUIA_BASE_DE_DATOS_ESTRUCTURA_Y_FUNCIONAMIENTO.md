# Guía de base de datos: estructura y funcionamiento

## 1. Para qué sirve

`reto_1_mio` centraliza los usuarios de la futura aplicación, el inventario de equipamientos, las ubicaciones del centro y los avisos de mantenimiento. También conserva el recorrido de cada equipamiento mientras este exista. Es una base exclusiva para esta versión individual.

Estado: instalación original y datos ejecutados por el usuario en Workbench. Sus capturas muestran cinco tablas, siete triggers, consultas de inconsistencias sin filas y ejecución transaccional terminada con ROLLBACK sin errores SQL. El usuario comunica funcionamiento correcto; no se han visto los nueve valores PASS/FAIL ni los rechazos individuales. No hay backend ni frontend todavía.

La separación de triggers conserva la lógica. Si ya existe la instalación, no ejecutar de nuevo esquema, triggers ni datos por esta reorganización.

## 2. Archivos y fuentes

Los originales están en `Documentacion/DB/Reto1_DB.sql` y `Reto1_Inserts.sql`, intactos. Al formar parte de la documentación copiada, `DB` no se renombra. La carpeta de trabajo nueva es `database`.

| Archivo de trabajo | Función |
|---|---|
| `00_comprobar_entorno.sql` | Consultar versión, existencia de base, tablas y triggers sin modificar nada |
| `01_crear_esquema.sql` | Crear base, cinco tablas, restricciones y Almacén obligatorio |
| `01b_crear_triggers.sql` | Crear los siete triggers antes de los datos |
| `02_datos_prueba.sql` | Insertar usuarios y datos ficticios, con traslados y distintos estados |
| `03_consultas_comprobacion.sql` | Mostrar contenido e identificar inconsistencias mediante consultas de lectura |
| `04_pruebas_transaccionales.sql` | Verificar comportamientos permitidos y deshacer sus filas con ROLLBACK |
| `05_pruebas_rechazo_manual.sql` | Casos comentados que deben producir errores; ejecutar de uno en uno |

Consulta [Workbench y pruebas](PRUEBAS_Y_WORKBENCH.md), [diccionario](DICCIONARIO_DE_DATOS.md), [diagrama editable](MODELO_ENTIDAD_RELACION.md) y [mapa mental](MAPA_MENTAL.md).

Requisitos de referencia: enunciado PDF pp. 2–8; rúbrica DWS, gestión de datos e integridad (30%), permisos y negocio (25%), MVC (20%). El resto del proyecto también debe cubrir servicios/integración (15%) y funcionamiento (10%); este bloque no los acredita por sí solo.

## 3. Cómo está construida

Cada tabla almacena una clase de información. Su clave primaria identifica cada fila. Una clave foránea apunta a una fila existente de otra tabla, evitando relaciones con objetos inexistentes.

| Tabla | Qué representa | Relaciones |
|---|---|---|
| usuarios | Una cuenta de aplicación, con hash y rol | Un usuario puede crear muchas notificaciones |
| ubicaciones | Un aula, laboratorio o Almacén | Una ubicación puede contener muchos equipos y aparecer en muchos intervalos |
| equipamientos | Una unidad de inventario, con categoría y ubicación actual | Cada equipo tiene una ubicación actual y muchos intervalos históricos |
| historico_ubicaciones | Una estancia del equipo en una ubicación | Relaciona equipo, ubicación y fechas; admite visitas repetidas |
| notificaciones | Un aviso con fecha, estado y creador | Cada aviso tiene un usuario creador |

No hay stock, compras ni tabla de categorías. Cada equipamiento es una unidad; la categoría es un enum del SQL original. No se asigna una relación de notificaciones con equipos que el requisito no exige.

El [diccionario](DICCIONARIO_DE_DATOS.md) describe todos los campos, tipos y valores por defecto. InnoDB proporciona transacciones e integridad referencial. `utf8mb4` permite texto español y Unicode; `utf8mb4_unicode_ci` compara nombres sin distinguir mayúsculas y con equivalencias de acentos. No imponer nombres únicos a equipamientos: puede haber varias unidades iguales.

## 4. Restricciones e índices

- IDs positivos mediante enteros UNSIGNED y claves primarias AUTO_INCREMENT.
- Nombre de usuario y nombre de ubicación únicos.
- Campos obligatorios NOT NULL; textos no vacíos mediante CHECK sobre TRIM.
- Roles, categorías y estados mediante ENUM y CHECK para impedir el valor vacío del enum incluso ante modos SQL permisivos.
- CHECK evita fecha de fin anterior al inicio.
- Claves foráneas evitan referencias inexistentes. Se usa ON UPDATE RESTRICT: los IDs no se editan.
- Borrar un equipo elimina sus intervalos mediante ON DELETE CASCADE, como en el original.
- Borrar ubicaciones usadas por equipos o histórico, o usuarios con notificaciones, queda bloqueado por RESTRICT. El frontend futuro deberá explicar el motivo.

Los índices de categoría y ubicación ayudan a filtrar inventario. Los de estado y creador ayudan a consultar avisos. El índice `(id_equipamiento, fecha_inicio, id_historico)` ordena el recorrido incluso cuando dos eventos comparten fecha. El de ubicación permite buscar estancias por destino.

`abierto` es un campo técnico generado, no un dato que escriba el usuario: vale 1 si `fecha_fin` es NULL y NULL en estancias cerradas. `UNIQUE(id_equipamiento, abierto)` permite muchas filas cerradas y **como máximo una abierta**, también ante UPDATE o escrituras simultáneas. No garantiza por sí solo que nunca se borre el intervalo actual: las escrituras del histórico deben quedar reservadas a los triggers.

## 5. Los siete triggers

| Trigger | Momento | Efecto |
|---|---|---|
| trg_equipamiento_ubicacion_inicial | BEFORE INSERT equipamientos | Fuerza Almacén aunque la petición indique otro destino |
| trg_equipamiento_crear_historico | AFTER INSERT equipamientos | Crea la primera estancia abierta |
| trg_equipamiento_traslado | AFTER UPDATE equipamientos | Si cambia ubicación, cierra estancia y abre la siguiente |
| trg_no_borrar_almacen | BEFORE DELETE ubicaciones | Impide eliminar Almacén |
| trg_no_renombrar_almacen | BEFORE UPDATE ubicaciones | Protege su nombre; permite editar descripción |
| trg_notificacion_solo_user | BEFORE INSERT notificaciones | Exige creador USER y fuerza PENDIENTE |
| trg_notificacion_no_borrar_realizada | BEFORE DELETE notificaciones | Impide borrar un aviso REALIZADO |

Un trigger se ejecuta como parte de la sentencia que lo activa; si falla, falla esa sentencia. No equivale a un controller ni identifica el usuario de la sesión web. Los permisos ADMIN/USER seguirán siendo responsabilidad de PHP.

## 6. Historial explicado con un ejemplo

1. ADMIN crea un portátil: queda en Almacén y nace un intervalo abierto (`fecha_fin = NULL`).
2. USER lo traslada a Aula 101: se cierra el intervalo de Almacén y se abre el de Aula 101.
3. USER lo traslada a Aula 102: se cierra el segundo y se abre el tercero.

Los datos demo contienen este recorrido. La ubicación actual está en `equipamientos.id_ubicacion_actual` para facilitar el inventario. El intervalo con fin NULL debe coincidir con ella. `03` detecta discrepancias.

El traslado usa una misma fecha para cerrar y abrir; las fechas tienen microsegundos. Se utiliza la mayor entre el reloj actual y el inicio abierto para evitar invertir fechas si retrocede el reloj. Actualizar marca, nombre o repetir destino no crea un nuevo intervalo.

El DAO futuro debe actualizar únicamente la ubicación del equipo; no debe insertar el histórico. No habrá un CRUD público para editar o borrar intervalos.

Si se elimina físicamente el equipo desaparece su histórico. Es el comportamiento heredado del original para permitir DELETE; conservarlo tras una baja exigiría acordar otra política con la profesora.

## 7. Orden en Workbench

**Abrir primero `database/00_comprobar_entorno.sql`.** Conectar con la cuenta SQL en Workbench, sin compartir su contraseña en el chat.

Si la base ya existe, consultar sus tablas y contenido y detenerse. Si no existe, ejecutar `01` una sola vez y configurar Workbench para detenerse al error. Después ejecutar `01b_crear_triggers.sql` una vez y `02` una vez, `03`, `04` y los bloques de `05` según su guía.

El esquema no es una migración ni un script idempotente. CREATE DATABASE fallará si existe; no continuar tras ese error. MySQL realiza commits implícitos en DDL, por lo que envolver la creación de tablas en una transacción no permitiría deshacer toda una instalación parcial. No se elimina ni reinicia la base automáticamente.

## 8. Datos de prueba y límites

Tres cuentas ficticias: `admin_demo`, `conserje_demo`, `conserje_dos_demo`. La contraseña exclusivamente de demostración es `DemoReto2026!`. Se generó un hash bcrypt con PHP y se verificó que coincide; no son contraseñas reales ni cuentas SQL. No usar estos datos para un despliegue público.

Después de una instalación nueva y `02`: 3 usuarios, 4 ubicaciones contando Almacén, 5 equipamientos (una categoría de cada tipo), 7 intervalos y 3 avisos (uno de cada estado). Se recuperan IDs por claves únicas y LAST_INSERT_ID, sin asumir que Almacén tenga ID 1.

Pendientes: evidencias detalladas de PASS/FAIL y rechazos, prueba de instalación con archivos separados, concurrencia de traslados, configuración de cuenta SQL, permisos HTTP y decisiones de autoría de avisos. Las consultas SQL de pruebas no verifican autorización de sesión.

## 9. Decisiones y fuentes técnicas

Las diferencias de clase, razones y consultas pendientes están en [DUDAS_Y_MEJORAS](../../docs/DUDAS_Y_MEJORAS.md). Los originales se verifican mediante [huellas SHA-256](ORIGINALES_SHA256.json).

Referencias oficiales contrastadas para el diseño:

- [Columnas generadas de MySQL](https://dev.mysql.com/doc/refman/8.0/en/create-table-generated-columns.html).
- [CREATE TABLE e índices únicos](https://dev.mysql.com/doc/refman/8.0/en/create-table.html).
- [CHECK y versión 8.0.16](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html).
- [Commits implícitos de DDL](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html).

Estas referencias respaldan decisiones técnicas; no sustituyen los requisitos del profesorado ni la ejecución de nuestras pruebas.
