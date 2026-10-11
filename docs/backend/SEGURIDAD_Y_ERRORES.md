# Sesiones, permisos y errores

## Autenticación

Se guarda la contraseña con `password_hash(..., PASSWORD_BCRYPT)` y se compara mediante `password_verify`, sin volver a hashear para comparar cadenas. Las altas y cambios requieren 12–72 bytes; el máximo evita truncado bcrypt. Es una mejora recomendada, no una longitud exigida expresamente por la profesora. Login no impone una nueva longitud mínima a cuentas ya existentes.

PHP usa cookies HttpOnly, SameSite=Strict, Secure cuando la conexión del servidor es HTTPS, modo estricto e IDs solo en cookie. Se regenera el ID al autenticar, cerrar o caducar la sesión. El token CSRF se renueva en esos cambios. La caducidad por inactividad es de 30 minutos. Las respuestas llevan `Cache-Control: no-store` y `X-Content-Type-Options: nosniff`.

Los archivos de sesión se guardan en `var/sessions`, fuera del directorio web y excluidos de Git. El control de permisos de esa carpeta debe verificarse en el despliegue Ubuntu.

Se guarda ID y una firma del hash de contraseña, no la contraseña. En cada operación se vuelve a leer el usuario: su rol actual determina el permiso; si fue borrado o cambió el hash, se invalida la sesión. El hash nunca se devuelve por HTTP. Tras cambiar su propia contraseña, el ADMIN deberá volver a iniciar sesión.

Hay cinco intentos de login por sesión en cinco minutos y un mensaje común para usuario inexistente o contraseña incorrecta. **No sustituye un limitador por IP**: borrar cookies o solicitar logout permite iniciar otra sesión. Antes de exposición real se recomienda rate limiting en Apache/proxy y HTTPS. No se ha configurado aquí.

## Permisos y reglas

Los controladores comprueban rol antes de validar y escribir datos. USER no puede crear/editar/borrar equipamientos; ADMIN no puede trasladarlos. Avisos: USER propio, ADMIN lectura general y edición de estado. Esta propiedad es una interpretación provisional registrada en las dudas, no un requisito literal claro.

La edición de datos y el traslado tienen rutas, campos y permisos distintos. Los campos adicionales provocan 422: no se ignora una tentativa de cambiar rol, estado, autor o ubicación mediante otro formulario.

El ADMIN no puede borrarse ni quitarse su propio rol. Las bajas y cambios de rol bloquean administradores dentro de una transacción y conservan al menos uno. Es una protección recomendada para evitar perder administración. Los usuarios con notificaciones no se pueden borrar por la FK del esquema; sus avisos no se reasignan automáticamente. Promover un USER a ADMIN no cambia la autoría de avisos antiguos: podrá leerlos como ADMIN, pero ya no editarlos como USER.

Las operaciones de actualización/borrado bloquean la fila durante comprobación y escritura. En notificaciones esto evita borrar simultáneamente al cambio a REALIZADA. Las FK protegen ubicaciones referenciadas por inventario o histórico. Borrar un equipo elimina su histórico mediante cascada, conforme al SQL original; la conservación tras baja sigue siendo una duda para el profesorado.

## Entradas y SQL

JSON debe ser un objeto UTF-8, máximo 64 KiB y profundidad 32. Texto obligatorio, límites correspondientes al esquema, IDs positivos hasta INT UNSIGNED, enums con lista cerrada. La descripción TEXT se limita también por bytes. Consultas de entrada preparadas con PDO nativo; los fragmentos SQL variables son constantes internas, nunca nombres o SQL enviados por el cliente.

El API no produce HTML. El futuro frontend deberá insertar los textos con `textContent` y tratar correctamente cada contexto de salida; la ausencia actual de vistas HTML no acredita pruebas completas de XSS del frontend.

## Errores HTTP

| Código | Significado |
|---|---|
| 400 | JSON inválido o cuerpo que no es objeto |
| 401 | Sin autenticación, credenciales incorrectas o sesión revocada |
| 403 | Rol insuficiente o CSRF incorrecto |
| 404 | Ruta/recurso inexistente; aviso ajeno oculto a USER |
| 405 | Método incorrecto; incluye cabecera Allow |
| 409 | Duplicado, FK, regla de BD, Almacén protegido, borrado REALIZADA o conflicto concurrente |
| 413 | Cuerpo demasiado grande |
| 415 | Tipo de contenido incorrecto |
| 422 | Campos ausentes, inesperados, formato o valores inválidos |
| 429 | Demasiados intentos de login por sesión |
| 500 | Fallo interno inesperado |
| 503 | Configuración MySQL ausente/incorrecta o conexión no disponible |

`HttpException` expresa errores esperables. Los controladores revierten transacciones y relanzan el error: no lo convierten silenciosamente en éxito. El punto de entrada traduce códigos PDO conocidos a conflictos; otros fallos son 500. Se registran tipo de excepción o SQLSTATE/código del driver, sin consultas, cuerpos, contraseñas ni mensaje interno del driver. El cliente recibe mensajes genéricos en fallos internos. No se han añadido excepciones diferentes por cada tabla.
