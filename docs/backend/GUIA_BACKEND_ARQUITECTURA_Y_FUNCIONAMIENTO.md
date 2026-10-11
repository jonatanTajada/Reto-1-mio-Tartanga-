# Guía del backend: arquitectura y funcionamiento

El backend es un API PHP que recibe peticiones HTTP y devuelve JSON. Se ha implementado sin frameworks y sin capa Service. El frontend todavía no existe. Los controladores comprueban quién puede realizar cada operación; los DAO ejecutan SQL preparado sobre la base **reto_1_mio**, que ya está instalada.

## Lectura recomendada

1. [Configuración y ejecución](CONFIGURACION_Y_EJECUCION.md).
2. [Endpoints y ejemplos](ENDPOINTS.md).
3. [Sesiones, permisos y errores](SEGURIDAD_Y_ERRORES.md).
4. [Pruebas y evidencia real](PRUEBAS_Y_ESTADO.md).
5. [Correspondencia con la rúbrica](RUBRICA.md).
6. [Diagramas editables](DIAGRAMAS.md) y [mapa mental](MAPA_MENTAL.md).

## Carpetas y responsabilidades

| Carpeta | Responsabilidad |
|---|---|
| `public/` | Única carpeta que se expone por HTTP. `index.php` selecciona ruta, método y controlador; `router.php` adapta el servidor local PHP; `.htaccess` adapta Apache |
| `config/` | Configuración de sesión y ejemplo de conexión; `database.local.php` privado se crea únicamente en cada equipo |
| `app/model/` | Modelos de los cinco módulos, validación de sus campos y conexión PDO |
| `app/dao/` | Consultas SQL de cada módulo; no lee sesiones ni decide roles |
| `app/controller/` | Autenticación, autorización, coordinación del DAO y transacciones de reglas de negocio |
| `app/http/` | Lectura JSON y seguridad de sesión/CSRF; auxiliares técnicos, sin una capa de negocio intermedia |
| `app/view/` | `Respuesta.php` representa la respuesta JSON; no es un frontend |
| `app/exception/` | Una excepción HTTP controlada para errores esperables |
| `tools/` | Comprobación de conexión de solo lectura, pruebas de validación y cliente de pruebas HTTP |
| `docs/backend/` | Esta documentación |

Los modelos son clases sencillas de validación y representación de datos, sin getters/setters vacíos ni una jerarquía de entidades. Los DAO devuelven filas asociativas; `Usuario::publico()` elimina el hash y `Historico::publico()` identifica el intervalo actual. Es una decisión didáctica, no una imposición de la rúbrica.

## Recorrido de una petición

Por ejemplo, `PATCH /api/equipamientos/5/ubicacion`:

1. `public/index.php` reconoce la ruta y acepta exclusivamente PATCH.
2. Comprueba el token CSRF y abre la conexión PDO configurada localmente.
3. `EquipamientoController` exige sesión vigente y rol USER.
4. Valida `id_ubicacion`, abre una transacción y bloquea el equipo para evitar escrituras simultáneas sobre la misma fila.
5. `EquipamientoDAO` actualiza solamente `id_ubicacion_actual` con parámetros preparados.
6. El trigger cierra el intervalo anterior y abre el nuevo. PHP no escribe histórico.
7. Se confirma la transacción y la vista devuelve JSON. Si algo falla, se revierte y se transforma el error en un código HTTP comprensible.

El autoload local de `app/bootstrap.php` carga clases de `App\...`; no usa Composer. La conexión no se abre al cargar archivos ni crea tablas.

## Límites de este bloque

Se han escrito todos los módulos solicitados. Hay evidencia de sintaxis, validaciones y HTTP sin MySQL; faltan pruebas positivas con la conexión local porque no hay credenciales configuradas. No se considera comprobado el CRUD real ni se acredita una nota. El componente externo de RA9, la interpretación de avisos propios y las contradicciones de clase se registran en [dudas y mejoras](../DUDAS_Y_MEJORAS.md). No se ha desplegado el servidor de clase.
