# Reto 1 mío — Gestión de equipamiento

Proyecto individual de aprendizaje de DAW. Permite preparar una aplicación para gestionar usuarios, equipamientos, ubicaciones, historial y notificaciones de mantenimiento de un centro educativo.

**Autor: Jonatan Tajada Rico.**

## Estado real

Bloque 1: instalación original y datos ejecutados por el usuario en Workbench. Sus capturas confirman cinco tablas, siete triggers, consultas de inconsistencias sin filas y ejecución transaccional terminada con ROLLBACK sin errores SQL. El usuario comunica funcionamiento correcto; los nueve valores PASS/FAIL y los rechazos individuales no tienen evidencia visual registrada.

Se han separado los triggers en `01b_crear_triggers.sql` y mejorado las cabeceras, sin cambiar lógica. **La base existente no necesita ninguna ejecución por esta reorganización.** La nueva disposición no se ha instalado de nuevo en MySQL.

Backend, frontend y despliegue pendientes. Todavía no hay aplicación web ejecutable ni login implementado. La revisión estática no sustituye las pruebas con el servidor.

## Tecnologías y arquitectura

- HTML, CSS y JavaScript para vistas, eventos, DOM y comunicación asíncrona (pendiente).
- PHP con MVC y DAO mediante PDO (pendiente), sin frameworks y **sin capa Service**.
- MySQL 8.0.16 o posterior; MySQL Workbench para ejecutar SQL.
- Mermaid para diagramas editables y Markdown compatible con Markmap para el mapa mental.

Los controllers coordinarán peticiones, validación y autorización; los modelos representarán datos y los DAO accederán a MySQL. Las vistas no consultarán directamente la BD. Los triggers mantendrán el histórico, sin duplicar esas inserciones en PHP.

## Estructura actual

```text
database/
  00_comprobar_entorno.sql
  01_crear_esquema.sql
  01b_crear_triggers.sql
  02_datos_prueba.sql
  03_consultas_comprobacion.sql
  04_pruebas_transaccionales.sql
  05_pruebas_rechazo_manual.sql
  docs/                       Guía, diccionario, pruebas y diagramas
docs/
  PLAN_Y_ESTADO.md
  DUDAS_Y_MEJORAS.md
  bbdd/README.md
  backend/README.md
  frontend/README.md
Documentacion/                Copia de clase local, intacta y excluida de Git
```

En el bloque 2 se definirán `controller`, `model`, `dao` y `config`; en el bloque 3 las vistas HTML, CSS y JavaScript. No se presentan como carpetas implementadas.

## Instalación y configuración de la BD

1. Disponer de un servidor MySQL >= 8.0.16 y Workbench. Workbench por sí solo no ejecuta una base de datos.
2. Abrir la conexión local de Workbench y autenticarte en su diálogo; no enviar contraseñas ni tokens por chat.
3. Abrir primero [database/00_comprobar_entorno.sql](database/00_comprobar_entorno.sql). Es de solo lectura.
4. Si `reto_1_mio` ya existe, inspeccionar su contenido y detener la instalación inicial. No sustituirlo ni borrar datos.
5. Si no existe, ejecutar `01_crear_esquema.sql` con detención al primer error. Después `01b_crear_triggers.sql`, `02_datos_prueba.sql` una sola vez y `03_consultas_comprobacion.sql`.
6. Seguir las [instrucciones completas y resultados esperados](database/docs/PRUEBAS_Y_WORKBENCH.md) para las pruebas 04 y 05.

Los scripts de trabajo solo usan `reto_1_mio`; no contienen instrucciones para eliminar bases. Las credenciales SQL reales se configurarán localmente en el bloque 2 y no se publicarán. Los usuarios ficticios del script de prueba son cuentas de la futura aplicación, no cuentas de MySQL.

## Funcionalidades y permisos previstos

| Operación | ADMIN | USER (conserje) |
|---|---|---|
| Login, logout, inventario y filtro por categoría | Sí | Sí |
| CRUD usuarios | Sí | No |
| Crear, editar datos y eliminar equipamientos | Sí | No |
| Cambiar ubicación del equipamiento | No | Sí |
| Consultar ubicaciones e historial | Sí | Sí |
| Crear, editar y eliminar ubicaciones | Sí | No |
| Consultar notificaciones | Sí | Sí |
| Crear y editar datos de notificaciones | No | Sí |
| Cambiar estado de notificaciones | Sí | No |
| Eliminar notificaciones no REALIZADAS | No | Sí |

Almacén es la ubicación inicial obligatoria. Las notificaciones comienzan PENDIENTES; las REALIZADAS no se eliminan. Los permisos de sesión quedan pendientes del backend. Las contradicciones de clase están registradas como interpretaciones provisionales.

## Documentación y comprobaciones

- [Plan y estado](docs/PLAN_Y_ESTADO.md).
- [Dudas, mejoras y decisiones](docs/DUDAS_Y_MEJORAS.md).
- [Guía principal de la base de datos](database/docs/GUIA_BASE_DE_DATOS_ESTRUCTURA_Y_FUNCIONAMIENTO.md).
- [Diccionario de datos](database/docs/DICCIONARIO_DE_DATOS.md).
- [Diagrama entidad-relación](database/docs/MODELO_ENTIDAD_RELACION.md).
- [Mapa mental editable](database/docs/MAPA_MENTAL.md).
- [Pruebas y Workbench](database/docs/PRUEBAS_Y_WORKBENCH.md).
- [Backend](docs/backend/README.md) y [frontend](docs/frontend/README.md), pendientes de sus revisiones.

La documentación copiada de clase se conserva localmente, sin incluirla en el repositorio público por contener información del grupo. Los originales SQL permanecen en `Documentacion/DB`; no deben ejecutarse para esta versión. Sus huellas están registradas en `database/docs/ORIGINALES_SHA256.json`.

## Git y despliegue

Repositorio individual: [Reto-1-mio-Tartanga-](https://github.com/jonatanTajada/Reto-1-mio-Tartanga-).
Se conserva cualquier historial remoto, sin push forzado. La situación de publicación se recoge en el plan.

El despliegue en Ubuntu Server es posterior: no se ha instalado ni configurado un servidor para esta versión.
