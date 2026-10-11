# Reto 1 mío — Gestión de equipamiento

Proyecto individual de aprendizaje de DAW. Permite preparar una aplicación para gestionar usuarios, equipamientos, ubicaciones, historial y notificaciones de mantenimiento de un centro educativo.

**Autor: Jonatan Tajada Rico.**

## Estado real

Bloque 1: instalación original y datos ejecutados por el usuario en Workbench. Sus capturas confirman cinco tablas, siete triggers, consultas de inconsistencias sin filas y ejecución transaccional terminada con ROLLBACK sin errores SQL. El usuario comunica funcionamiento correcto; los nueve valores PASS/FAIL y los rechazos individuales no tienen evidencia visual registrada.

Se han separado los triggers en `01b_crear_triggers.sql` y mejorado las cabeceras, sin cambiar lógica. **La base existente no necesita ninguna ejecución por esta reorganización.** La nueva disposición no se ha instalado de nuevo en MySQL.

Backend PHP implementado y probado con MySQL: rutas JSON, login/logout, sesiones, permisos, modelos, DAO y controladores de los cinco módulos. Comprobadas sintaxis, 11 validaciones, **115 respuestas HTTP** y ocho controles de integridad/limpieza. Los datos existentes y sus históricos se conservan; no quedan filas temporales. El componente externo RA9 todavía no está integrado. Frontend y despliegue pendientes.

## Tecnologías y arquitectura

- HTML, CSS y JavaScript para vistas, eventos, DOM y comunicación asíncrona (pendiente).
- PHP >= 8.2 con MVC y DAO mediante PDO, sin frameworks y **sin capa Service**.
- MySQL 8.0.16 o posterior; MySQL Workbench para ejecutar SQL.
- Mermaid para diagramas editables y Markdown compatible con Markmap para el mapa mental.

Los controladores coordinan peticiones, validación y autorización; los modelos validan y representan datos y los DAO acceden a MySQL. La vista JSON no consulta directamente la BD. Los triggers mantienen el histórico, sin duplicar esas inserciones en PHP.

## Estructura actual

```text
app/
  controller/                 Permisos, coordinación y transacciones
  model/                      Datos, validación y conexión PDO
  dao/                        SQL preparado
  http/                       Petición JSON y sesión/CSRF
  view/                       Respuesta JSON
  exception/                  Error HTTP controlado
  bootstrap.php               Carga local de clases
config/
  app.php                     Sesión
  database.example.php        Ejemplo público, sin credenciales reales
  database.local.php          Privado; crear localmente, excluido de Git
public/                       Único directorio expuesto por HTTP
tools/                        Comprobaciones PHP y cliente de pruebas HTTP
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
  backend/                    Guía, endpoints, seguridad, pruebas y diagramas
  frontend/README.md
Documentacion/                Copia de clase local, intacta y excluida de Git
```

Las vistas HTML, CSS y JavaScript se desarrollarán después de revisar el backend. La carpeta `app/view` actual solo representa JSON.

## Ejecutar el backend existente

La base de datos ya está creada: **no volver a ejecutar la instalación**. Desde la raíz de la carpeta individual:

```powershell
if (!(Test-Path config/database.local.php)) {
    Copy-Item config/database.example.php config/database.local.php
}
# Completar usuario y contraseña MySQL editando ese archivo privado.
php tools/comprobar_conexion.php
php -S 127.0.0.1:8080 -t public public/router.php
```

Abrir `http://127.0.0.1:8080/api/sesion`. Requiere PHP con pdo_mysql. Solo se admite conexión a `reto_1_mio`. No enviar credenciales al chat ni subir el archivo local.

En otra terminal: `php tools/probar_modelos.php`, `python tools/probar_http.py` y, con la conexión disponible, `python tools/probar_http.py --completo`. La prueba completa crea y limpia filas aisladas; conserva los datos anteriores. Consulta la [guía de ejecución](docs/backend/CONFIGURACION_Y_EJECUCION.md) y los [endpoints y ejemplos](docs/backend/ENDPOINTS.md).

## Instalación y configuración de la BD

1. Disponer de un servidor MySQL >= 8.0.16 y Workbench. Workbench por sí solo no ejecuta una base de datos.
2. Abrir la conexión local de Workbench y autenticarte en su diálogo; no enviar contraseñas ni tokens por chat.
3. Abrir primero [database/00_comprobar_entorno.sql](database/00_comprobar_entorno.sql). Es de solo lectura.
4. Si `reto_1_mio` ya existe, inspeccionar su contenido y detener la instalación inicial. No sustituirlo ni borrar datos.
5. Si no existe, ejecutar `01_crear_esquema.sql` con detención al primer error. Después `01b_crear_triggers.sql`, `02_datos_prueba.sql` una sola vez y `03_consultas_comprobacion.sql`.
6. Seguir las [instrucciones completas y resultados esperados](database/docs/PRUEBAS_Y_WORKBENCH.md) para las pruebas 04 y 05.

Los scripts de trabajo solo usan `reto_1_mio`; no contienen instrucciones para eliminar bases. Las credenciales SQL reales se configuran localmente y no se publican. Los usuarios ficticios del script de prueba son cuentas de aplicación, no cuentas de MySQL.

## Funcionalidades y permisos implementados en el código

| Operación | ADMIN | USER (conserje) |
|---|---|---|
| Login, logout, inventario y filtro por categoría | Sí | Sí |
| CRUD usuarios | Sí | No |
| Crear, editar datos y eliminar equipamientos | Sí | No |
| Cambiar ubicación del equipamiento | No | Sí |
| Consultar ubicaciones e historial | Sí | Sí |
| Crear, editar y eliminar ubicaciones | Sí | No |
| Consultar notificaciones | Todas | Propias |
| Crear y editar datos de notificaciones | No | Propias |
| Cambiar estado de notificaciones | Sí | No |
| Eliminar notificaciones no REALIZADAS | No | Propias |

Almacén es la ubicación inicial obligatoria. Las notificaciones comienzan PENDIENTES; las REALIZADAS no se eliminan. El control por propietario USER es una interpretación provisional. Los permisos ADMIN/USER y rechazos de operaciones prohibidas se han probado por HTTP con MySQL. Las contradicciones de clase están registradas en las dudas.

## Documentación y comprobaciones

- [Plan y estado](docs/PLAN_Y_ESTADO.md).
- [Dudas, mejoras y decisiones](docs/DUDAS_Y_MEJORAS.md).
- [Guía principal de la base de datos](database/docs/GUIA_BASE_DE_DATOS_ESTRUCTURA_Y_FUNCIONAMIENTO.md).
- [Diccionario de datos](database/docs/DICCIONARIO_DE_DATOS.md).
- [Diagrama entidad-relación](database/docs/MODELO_ENTIDAD_RELACION.md).
- [Mapa mental editable](database/docs/MAPA_MENTAL.md).
- [Pruebas y Workbench](database/docs/PRUEBAS_Y_WORKBENCH.md).
- [Guía del backend](docs/backend/GUIA_BACKEND_ARQUITECTURA_Y_FUNCIONAMIENTO.md).
- [Pruebas del backend y limitaciones](docs/backend/PRUEBAS_Y_ESTADO.md).
- [Correspondencia con la rúbrica](docs/backend/RUBRICA.md).
- [Diagramas del backend](docs/backend/DIAGRAMAS.md).
- [Frontend pendiente](docs/frontend/README.md).

La documentación copiada de clase se conserva localmente, sin incluirla en el repositorio público por contener información del grupo. Los originales SQL permanecen en `Documentacion/DB`; no deben ejecutarse para esta versión. Sus huellas están registradas en `database/docs/ORIGINALES_SHA256.json`.

## Git y despliegue

Repositorio individual: [Reto-1-mio-Tartanga-](https://github.com/jonatanTajada/Reto-1-mio-Tartanga-).
Se conserva cualquier historial remoto, sin push forzado. La situación de publicación se recoge en el plan.

El despliegue en Ubuntu Server es posterior: no se ha instalado ni configurado un servidor para esta versión.
