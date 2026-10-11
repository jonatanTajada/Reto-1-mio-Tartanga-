# Ejecución y recorrido por roles

La base ya existe. No repetir `01_crear_esquema.sql`, triggers ni INSERT de instalación. Las credenciales SQL privadas están en `config/database.local.php`, excluidas de Git. No cambiarlas por las contraseñas de la aplicación.

Desde la raíz de «Reto 1 mio»:

```powershell
php tools/comprobar_conexion.php
php -S 127.0.0.1:8080 -t public public/router.php
```

Abrir **http://127.0.0.1:8080/**. Mantener la terminal abierta; Ctrl+C detiene el servidor. PHP >= 8.2 con pdo_mysql y navegador moderno con módulos JS/dialog. No hace falta Node para utilizar la aplicación; Node solo sirve para nuestras pruebas automatizadas de navegador.

## Cuentas ficticias de demostración

Están documentadas también en [endpoints del backend](../backend/ENDPOINTS.md) y en los datos SQL de demostración:

| Rol | Usuario | Contraseña de aplicación ficticia |
|---|---|---|
| Administrador | `admin_demo` | `DemoReto2026!` |
| Conserje | `conserje_demo` | `DemoReto2026!` |
| Segundo Conserje | `conserje_dos_demo` | `DemoReto2026!` |

Solo para demostración local; no son usuarios/contraseñas de MySQL. No se publican las credenciales reales del servidor.

## Recorrido del Administrador

1. Acceder e inspeccionar inventario, categoría y detalle/historial de un equipo.
2. Crear un equipo: queda en Almacén; editar datos sin opción de traslado.
3. Consultar ubicaciones y sus acciones. Almacén no ofrece eliminar; su nombre no se edita.
4. Abrir Usuarios para consultar, crear o editar una cuenta. Dejar contraseña vacía en edición la conserva.
5. Abrir Notificaciones para consultar todos los avisos y cambiar su estado. No hay alta, edición de contenido ni borrado ADMIN.
6. Cerrar sesión. Para ensayar borrados, usar exclusivamente registros de prueba propios y revisar la confirmación.

## Recorrido del Conserje

1. Acceder, consultar inventario y filtrar categoría. No aparece Usuarios ni alta/edición/borrado de equipos.
2. Abrir Detalle e historial; usar Trasladar y seleccionar un destino existente.
3. Consultar Ubicaciones, sin acciones de escritura.
4. Abrir Notificaciones propias, crear y editar un aviso. No hay selector de estado ni autor.
5. Puede eliminar un aviso pendiente/en proceso tras confirmar. Un realizado muestra «No se puede eliminar».
6. Cerrar sesión.

## Pruebas reproducibles

Con el servidor activo, en otra terminal:

```powershell
python tools/revisar_frontend.py
python tools/probar_http.py --completo
node tools/probar_frontend.mjs
php tools/comprobar_integridad.php
```

El cliente Chrome necesita Node 22 o posterior y Chrome instalado en la ruta Windows documentada en el script; `RETO_CHROME` permite indicar otra ruta local. Usa CDP nativo, sin instalar Playwright, Selenium o librerías. Abre un perfil propio en `var/browser`, excluido de Git, sin una ventana visible, y termina su proceso al acabar. Las capturas se guardan en `docs/frontend/evidencias`.

Las pruebas crean filas ficticias `http_test_` y `ui_test_`, comparan datos anteriores y limpian solo sus IDs. No ejecutarlas simultáneamente ni mientras otros usuarios escriben. Si se interrumpen a la fuerza, la limpieza puede quedar pendiente: conservar la salida y revisar solo los IDs de esa ejecución, sin borrar tablas ni restablecer secuencias.
