# Pruebas y estado comprobado

Fecha: 11/10/2026. Estas evidencias distinguen archivos implementados de funcionamiento ejecutado.

## Ejecutado por el agente

- PHP 8.4.25: comprobación `php -l` de los 28 archivos PHP iniciales, sin errores de sintaxis. Los cambios posteriores también se revisan antes del commit.
- `php tools/probar_modelos.php`: 11 comprobaciones correctas. Unicode, vacío, tipo incorrecto, ID malicioso/fuera de rango, límite bcrypt, separación de ubicación/estado, límite TEXT por bytes, hash verificable y hash excluido de respuesta.
- Servidor PHP local en `127.0.0.1:8080`: nueve respuestas HTTP comprobadas con `python tools/probar_http.py`. Sesión anónima, rutas 404, método 405, CSRF 403, recursos privados 401 y logout; también se comprueban cookie HttpOnly/SameSite y cabeceras no-store/nosniff.
- `php tools/comprobar_conexion.php`: no conecta porque falta `config/database.local.php`. No se han supuesto credenciales ni ejecutado instalación.
- `python tools/probar_http.py --completo`: las comprobaciones públicas pasan y el login se detiene con HTTP 503 por falta de configuración. **No acredita login válido, CRUD, permisos ADMIN/USER ni triggers mediante PHP.** No llegó a crear filas de prueba.
- `python database/tools/validar_archivos.py`: originales conservados y comprobación estática de SQL/documentación válida.

## Prueba completa preparada

Primero configura la conexión privada y compruébala. Inicia el servidor local y, en otra terminal desde la raíz del proyecto:

```powershell
php tools/probar_modelos.php
python tools/probar_http.py
python tools/probar_http.py --completo
```

El modo completo utiliza `admin_demo` y la contraseña ficticia documentada. Si se necesita otro administrador, se pueden proporcionar `RETO_TEST_ADMIN` y `RETO_TEST_PASSWORD` en el entorno local de la terminal, sin publicarlos. **No utiliza la contraseña SQL como contraseña de aplicación.**

La prueba crea dos USER ficticios, una ubicación, un equipo y un aviso con prefijo aleatorio. Comprueba CRUD, cambios de contraseña y revocación, filtro por categoría, continuidad del histórico, repetición de destino, permisos prohibidos, avisos ajenos, rechazo de borrar REALIZADA, borrado EN_PROCESO, Almacén, duplicados, entrada inválida y cuerpos grandes. No modifica datos de demostración existentes. El bloque `finally` limpia únicamente sus IDs, y compara las colecciones originales antes/después. Los huecos de AUTO_INCREMENT son normales y no se reinician.

Ejecutar sin otros usuarios escribiendo al mismo tiempo: la comparación final detectaría también cambios ajenos. Si se interrumpe Python a la fuerza o se cae el servidor, la limpieza puede quedar incompleta; conserva la salida y revisa exclusivamente las filas con el prefijo `http_test_` de esa ejecución. No borres tablas ni vuelvas a sembrar datos para limpiar.

## Evidencia anterior del usuario

Workbench confirmó cinco tablas, siete triggers, datos de demostración y cuatro consultas de inconsistencia sin filas. La prueba SQL 04 terminó con ROLLBACK sin errores SQL. Las capturas no mostraban los nueve valores PASS/FAIL ni cada rechazo manual de 05. No se sustituye esa evidencia por una afirmación de pruebas positivas del backend.

## Pendientes reales

- Conexión MySQL local y ejecución completa del cliente HTTP.
- Rechazos individuales SQL 05, si se desea cerrar la evidencia de base de datos.
- Pruebas de carreras concurrentes; hay bloqueos y transacciones implementados, pero no una prueba de carga/concurrencia ejecutada.
- Componente externo RA9 y alcance exacto que acepte el profesorado.
- TLS, cookies Secure bajo HTTPS, Apache/Ubuntu y limitación por IP.
- Frontend, pruebas de navegador, accesibilidad y usabilidad.

Los ejemplos de documentación son ilustraciones, no capturas de resultados reales.
