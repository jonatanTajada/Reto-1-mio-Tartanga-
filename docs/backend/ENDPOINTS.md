# Endpoints del API

Prefijo `/api`. Cuerpos de escritura como objetos JSON con `Content-Type: application/json`. Enviar la cookie de sesión y `X-CSRF-Token` en POST, PUT, PATCH y DELETE. Obtener primero el token con GET `/api/sesion`; login y logout lo renuevan. No se usa CORS: el futuro frontend se servirá desde el mismo origen.

## Sesión y catálogos

| Método y ruta | Entrada | Acceso |
|---|---|---|
| GET `/api/sesion` | Sin cuerpo | Público; devuelve usuario o null y csrf_token |
| POST `/api/login` | nombre_usuario, password | Público con CSRF; autentica y renueva sesión/token |
| POST `/api/logout` | Sin cuerpo | Con CSRF; cierra autenticación aunque MySQL esté desconectado |
| GET `/api/catalogos` | Sin cuerpo | ADMIN/USER; categorías, roles y estados válidos |

## Recursos

En la tabla `{id}` es el identificador entero positivo del recurso. PUT exige todos los campos de edición; no es una actualización parcial. DELETE devuelve `{"eliminado":true}` en `datos` con HTTP 200.

| Recurso | GET colección / GET `{id}` | POST colección | PUT `{id}` | DELETE `{id}` |
|---|---|---|---|---|
| `/api/usuarios` | ADMIN | ADMIN | ADMIN | ADMIN |
| `/api/equipamientos` | ADMIN/USER | ADMIN | ADMIN | ADMIN |
| `/api/ubicaciones` | ADMIN/USER | ADMIN | ADMIN | ADMIN |
| `/api/notificaciones` | ADMIN todas / USER propias | USER | USER propias | USER propias, salvo REALIZADA |

Campos:

- Usuario: `nombre`, `apellidos`, `nombre_usuario`, `rol`, `password`. Password obligatorio en POST, opcional en PUT. Nunca devolver `password_hash`.
- Equipamiento: `nombre`, `descripcion`, `marca`, `modelo`, `categoria`. El alta siempre comienza en Almacén. No admite campos de ubicación.
- Ubicación: `nombre`, `descripcion`. Almacén admite editar descripción, no renombrar ni borrar.
- Notificación: `titulo`, `descripcion`. No admite `id_usuario`, `estado` ni fechas: el autor procede de la sesión y el estado inicial del trigger.

Operaciones independientes:

| Método y ruta | Entrada | Acceso y resultado |
|---|---|---|
| GET `/api/equipamientos?categoria=PORTATIL` | Categoría opcional | ADMIN/USER; inventario filtrado |
| PATCH `/api/equipamientos/{id}/ubicacion` | `id_ubicacion` entero | Solo USER; mismo destino no añade intervalo |
| GET `/api/equipamientos/{id}/historial` | Sin cuerpo | ADMIN/USER; intervalos ordenados, ubicación y `actual` |
| PATCH `/api/notificaciones/{id}/estado` | `estado` | Solo ADMIN; PENDIENTE, EN_PROCESO o REALIZADA |

No existen rutas para modificar histórico. No se acepta cambiar autor de avisos, IDs o campos inesperados. Las listas no tienen paginación en esta versión educativa; deberá añadirse si crece el volumen. La edición de un aviso REALIZADA sigue permitida a su propietario: el texto solo prohíbe eliminarlo. ADMIN puede volver a cambiar el estado; no se ha inventado una máquina de estados irreversible.

## Ejemplo de recorrido con PowerShell

```powershell
$base = 'http://127.0.0.1:8080'
$sesion = Invoke-RestMethod "$base/api/sesion" -SessionVariable cookies
$cabecera = @{ 'X-CSRF-Token' = $sesion.datos.csrf_token }
$cuerpo = @{ nombre_usuario = 'admin_demo'; password = 'DemoReto2026!' } | ConvertTo-Json
$login = Invoke-RestMethod "$base/api/login" -Method Post -WebSession $cookies -Headers $cabecera -ContentType 'application/json' -Body $cuerpo
$cabecera = @{ 'X-CSRF-Token' = $login.datos.csrf_token }
Invoke-RestMethod "$base/api/equipamientos?categoria=PORTATIL" -WebSession $cookies
Invoke-RestMethod "$base/api/logout" -Method Post -WebSession $cookies -Headers $cabecera
```

La contraseña anterior pertenece únicamente a las identidades ficticias de `02_datos_prueba.sql`. No sirve como contraseña MySQL ni debe usarse en producción. USER de demostración: `conserje_demo`, misma contraseña ficticia.

Ejemplo ilustrativo de alta:

```json
{"nombre":"Equipo de prueba","descripcion":"Portátil de aula","marca":"Demo","modelo":"P1","categoria":"PORTATIL"}
```

Respuesta de éxito (ID ilustrativo, no evidencia de ejecución):

```json
{"ok":true,"datos":{"id_equipamiento":8,"nombre":"Equipo de prueba","descripcion":"Portátil de aula","marca":"Demo","modelo":"P1","categoria":"PORTATIL","id_ubicacion_actual":1}}
```

POST de recursos devuelve 201; lectura, login, logout, edición y borrado, 200. Las colecciones son arrays en `datos`; un registro individual es un objeto. Las fechas SQL son cadenas `YYYY-MM-DD HH:MM:SS.ffffff`, sin zona incorporada.

Error ilustrativo:

```json
{"ok":false,"error":{"mensaje":"Tu rol no permite esta operación.","detalles":[]}}
```
