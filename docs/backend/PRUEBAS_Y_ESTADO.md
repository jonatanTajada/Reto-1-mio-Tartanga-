# Pruebas y estado comprobado

Fecha: 11/10/2026. Estas evidencias distinguen archivos implementados de funcionamiento ejecutado.

## Ejecutado por el agente

- PHP 8.4.25: comprobación `php -l` de los 28 archivos PHP iniciales y del nuevo comprobador de integridad, sin errores de sintaxis (29 archivos PHP del proyecto, sin contar la configuración privada).
- `php tools/probar_modelos.php`: 11 comprobaciones correctas. Unicode, vacío, tipo incorrecto, ID malicioso/fuera de rango, límite bcrypt, separación de ubicación/estado, límite TEXT por bytes, hash verificable y hash excluido de respuesta.
- Servidor PHP local en `127.0.0.1:8080`: nueve respuestas HTTP comprobadas con `python tools/probar_http.py`. Sesión anónima, rutas 404, método 405, CSRF 403, recursos privados 401 y logout; también se comprueban cookie HttpOnly/SameSite y cabeceras no-store/nosniff.
- `php tools/comprobar_conexion.php`: conexión correcta con `reto_1_mio`, después de que el usuario configurara el archivo privado. No se mostraron credenciales ni se ejecutó instalación.
- `python tools/probar_http.py --completo`: **115 respuestas HTTP correctas** en la versión ampliada. Login ADMIN y dos USER temporales, CRUD, permisos prohibidos, avisos propios/ajenos, CSRF, campos inesperados, JSON/tamaño/formato, duplicados, Almacén, FK, continuidad y repetición del traslado, cambio de rol en sesión abierta y revocación por contraseña.
- `php tools/comprobar_integridad.php`: ocho consultas correctas, cero inconsistencias y cero filas temporales. Recuento final: usuarios 3, ubicaciones 4, equipamientos 5, histórico 7, notificaciones 3.
- Las colecciones existentes y el histórico de cada equipo anterior se compararon antes/después y se conservaron exactamente. No se borró ni recreó ninguna tabla/base ni se reiniciaron secuencias.
- `python database/tools/validar_archivos.py`: originales conservados y comprobación estática de SQL/documentación válida.

El intento de la entrega inicial terminó en 503 por falta de configuración; esta nueva evidencia lo sustituye. La primera ejecución con conexión pasó, pero el contador omitía dos peticiones anónimas (indicaba 81 en lugar de 83). Se corrigió el contador y se amplió la cobertura; la cifra final 115 incluye todas las respuestas de todos los clientes.

## Repetir la prueba completa

Primero configura la conexión privada y compruébala. Inicia el servidor local y, en otra terminal desde la raíz del proyecto:

```powershell
php tools/probar_modelos.php
python tools/probar_http.py
python tools/probar_http.py --completo
php tools/comprobar_integridad.php
```

El modo completo utiliza `admin_demo` y la contraseña ficticia documentada. Si se necesita otro administrador, se pueden proporcionar `RETO_TEST_ADMIN` y `RETO_TEST_PASSWORD` en el entorno local de la terminal, sin publicarlos. **No utiliza la contraseña SQL como contraseña de aplicación.**

La prueba crea dos USER ficticios, una ubicación, un equipo y un aviso con prefijo aleatorio. Promueve y devuelve a USER una cuenta temporal para comprobar que el rol se revalida sin login nuevo. No modifica datos de demostración existentes. El bloque `finally` limpia únicamente sus IDs, y compara las colecciones e históricos originales antes/después. Los huecos de AUTO_INCREMENT son normales y no se reinician. No se encontraron fallos funcionales en los escenarios ejecutados; el cambio correctivo afectó al contador del cliente de pruebas.

Ejecutar sin otros usuarios escribiendo al mismo tiempo: la comparación final detectaría también cambios ajenos. Si se interrumpe Python a la fuerza o se cae el servidor, la limpieza puede quedar incompleta; conserva la salida y revisa exclusivamente las filas con el prefijo `http_test_` de esa ejecución. No borres tablas ni vuelvas a sembrar datos para limpiar.

## Evidencia anterior del usuario

Workbench confirmó cinco tablas, siete triggers, datos de demostración y cuatro consultas de inconsistencia sin filas. La prueba SQL 04 terminó con ROLLBACK sin errores SQL. Las capturas no mostraban los nueve valores PASS/FAIL ni cada rechazo manual de 05. Las pruebas nuevas comprueban reglas a través del backend; no significan que se haya ejecutado cada bloque del SQL 05.

## Pendientes reales

- Rechazos individuales SQL 05, si se desea cerrar la evidencia de base de datos.
- Pruebas de carreras concurrentes; hay bloqueos y transacciones implementados, pero no una prueba de carga/concurrencia ejecutada.
- Componente externo RA9 y alcance exacto que acepte el profesorado.
- TLS, cookies Secure bajo HTTPS, Apache/Ubuntu y limitación por IP.
- Frontend, pruebas de navegador, accesibilidad y usabilidad.

Los ejemplos de documentación son ilustraciones, no capturas de resultados reales.
