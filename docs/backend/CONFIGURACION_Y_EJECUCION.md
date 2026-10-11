# Configuración y ejecución

## Requisitos

PHP 8.2 o posterior con PDO, pdo_mysql, session y JSON; MySQL 8.0.16 o posterior con la base `reto_1_mio` ya instalada y sus siete triggers. Se ha utilizado PHP CLI 8.4.25 para las comprobaciones locales. No requiere mbstring, Composer ni un framework. Python 3 solo se utiliza para el cliente de pruebas, no para ejecutar la aplicación.

## Credenciales privadas

Desde la raíz de **Reto 1 mio**, copia `config/database.example.php` a `config/database.local.php`. Completa el usuario y la contraseña de tu servidor MySQL editando ese archivo local. Mantén `database` como `reto_1_mio`; la clase `Conexion` rechaza otro nombre. No pegues las credenciales en el chat, los documentos ni los comandos de Git.

El ejemplo usa host `127.0.0.1` y puerto `3306`. El archivo local está excluido por `/config/*.local.php` en `.gitignore`. No se crea automáticamente con una contraseña supuesta.

```powershell
Copy-Item config/database.example.php config/database.local.php
php tools/comprobar_conexion.php
```

La comprobación consulta solamente `SELECT DATABASE()`. No recrea la base ni ejecuta los scripts de instalación. Un 503 significa que falta configuración o que el servidor rechaza la conexión; no es una instrucción para reinstalar.

`Conexion.php` configura utf8mb4, excepciones PDO, resultado asociativo, SQL estricto y preparaciones nativas (`ATTR_EMULATE_PREPARES=false`). No fuerza otra zona horaria SQL porque `DATETIME` no conserva zona y los registros existentes se insertaron desde Workbench; las fechas se interpretan con la zona del servidor MySQL. PHP usa UTC para su entorno y segundos Unix para caducidad de sesión. Una política común de zona horaria queda pendiente del despliegue.

## Cuenta SQL recomendada

Es recomendable crear, posteriormente y desde administración MySQL, una cuenta exclusiva para runtime con permisos sobre `reto_1_mio` solamente. Necesita SELECT/INSERT/UPDATE/DELETE en usuarios, equipamientos, ubicaciones y notificaciones, y **solo SELECT** en histórico. Los triggers ya existentes deben mantener un definidor con permisos para escribir el histórico. No se han creado cuentas ni concedido privilegios. Usar root en una demostración no acredita configuración segura de despliegue.

## Servidor local

```powershell
php -S 127.0.0.1:8080 -t public public/router.php
```

Mantén la terminal abierta y consulta `http://127.0.0.1:8080/api/sesion`. Detén el servidor con Ctrl+C. La raíz `/` no es una página de inicio: todavía no hay frontend. El servidor integrado se usa para desarrollo, no como servidor de clase.

PHP crea `var/sessions` para sus archivos privados de sesión; `var/` está excluido de Git y queda fuera de `public`. El usuario del proceso PHP necesita escritura allí. En Ubuntu debe tener acceso exclusivo para el usuario web; la carpeta se crea con modo 0700 cuando el sistema lo admite.

## Ubuntu Server, posteriormente

Usar Apache con PHP y pdo_mysql; configurar **DocumentRoot apuntando a `public/`**, nunca a la raíz del repositorio. Si se usa `.htaccess`, habilitar `mod_rewrite` y permitir sus directivas en ese directorio. Configurar la cookie Secure mediante HTTPS directo en Apache; la detección actual usa `HTTPS` del servidor, no cabeceras enviadas por el cliente. Un proxy HTTPS requiere configuración explícita y no se ha probado.

Mantener MySQL accesible localmente, restringir el firewall al acceso web necesario de la clase y proteger archivos de configuración con permisos del sistema. Para los ordenadores de clase se utilizará la IP de la VM y el servidor web configurado, con red y TLS verificados. Esta sección es una recomendación de despliegue; no se ha instalado ni modificado Ubuntu.

## Referencias técnicas

[Opciones PDO](https://www.php.net/manual/en/pdo.setattribute.php), [seguridad de sesiones PHP](https://www.php.net/manual/en/session.security.ini.php) y [password_verify](https://www.php.net/manual/en/function.password-verify.php).
