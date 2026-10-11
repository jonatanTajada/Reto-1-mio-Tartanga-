# Plan y estado

Fecha de revisión: 11 de octubre de 2026.

## Bloque 1 — Base de datos

- [x] Confirmar `Reto 1 mio` y limitar el trabajo a ella.
- [x] Leer los originales SQL, enunciado, rúbricas, planteamiento, tareas y esquemas copiados.
- [x] Conservar intacta `Documentacion/DB` y crear `database` independiente.
- [x] Preparar esquema `reto_1_mio`, datos ficticios y consultas separados.
- [x] Preparar pruebas de aceptación y rechazo, guía, diccionario y diagramas editables.
- [x] Generar y verificar con PHP el hash de la contraseña ficticia de demostración.
- [x] Detectar cliente MySQL 8.0.43 y servicio MySQL80 activo.
- [x] Usuario ejecutó esquema original y datos desde Workbench (capturas).
- [x] Preflight del usuario confirmó que la base no existía antes del alta.
- [ ] Ejecutar pruebas 04 y 05 y registrar resultados reales.
- [x] Usuario autorizó el bloque 2 y sus módulos backend.

Las capturas confirman cinco tablas y siete triggers; 04 terminó con ROLLBACK. Los nueve valores de resultado y los rechazos siguen sin evidencia individual registrada. La validación estática, los enlaces y la conservación de originales se documentan en la guía de pruebas.

## Bloque 2 — Backend autorizado e implementado; comprobación MySQL pendiente

- [x] Releer enunciado y rúbrica DWS copiados en el proyecto individual.
- [x] Ejemplo público y clase PDO; archivo local privado excluido de Git; base exclusiva `reto_1_mio`.
- [x] Modelos, DAO, controladores y rutas, sin Service ni framework.
- [x] Login/logout, sesión, CSRF, roles y validación por operación.
- [x] Usuarios, equipamientos, ubicaciones, histórico y notificaciones.
- [x] Separar edición ADMIN y traslado USER, con histórico escrito solo por triggers.
- [x] Excepciones, JSON, códigos HTTP y transacciones.
- [x] Guía backend, endpoints, seguridad, pruebas y diagramas editables.
- [x] Sintaxis PHP, 11 reglas de entrada y nueve respuestas HTTP públicas comprobadas.
- [x] Cliente de prueba completa con datos temporales y limpieza específica por ID.
- [ ] Configurar credenciales privadas: todavía falta `config/database.local.php`.
- [ ] Conexión y prueba HTTP completa: intento ejecutado se detiene en login con 503.
- [ ] Componente externo RA9 funcional, sujeto a concretar integración útil dentro del alcance.
- [ ] Revisión del usuario antes de empezar frontend.

No se recreó la base, no se instaló software ni se modificó documentación oficial. Detenerse al entregar este bloque; el frontend sigue sin autorización. Véase [evidencia del backend](backend/PRUEBAS_Y_ESTADO.md).

## Bloque 3 — Frontend, pendiente de aprobación del backend

HTML semántico, CSS homogéneo y JavaScript modular. Login, navegación por rol, inventario, filtro, CRUD, traslado, histórico y avisos. Guía de estilo, eventos, DOM y asincronía. Pruebas de integración, accesibilidad con herramientas externas y usabilidad con usuarios reales; no afirmar pruebas humanas sin realizarlas. Detenerse para revisión.

## Después

Despliegue Ubuntu Server, documentación de red y acceso desde clase. No autorizado ahora instalar ni configurar el sistema. No se garantiza cumplir todas las rúbricas hasta disponer de la aplicación y sus evidencias.

## Publicación

Antes de inicializar Git se comprobó que la carpeta individual no pertenecía a un repositorio local. `git ls-remote` sobre el repositorio autorizado terminó correctamente sin referencias: remoto vacío en ese momento.

Repositorio local inicializado con rama main y origin vinculado al remoto autorizado. Fetch confirmó que no había ramas remotas. `.gitignore` excluye documentos de clase, archivos privados y dependencias. Comprobación estática PASS: 13 originales intactos, 5 tablas, 7 triggers y enlaces válidos. Instalación original ejecutada por el usuario; nueva separación verificada por comparación de sentencias, sin reinstalar.

Publicación confirmada: primer push de main realizado el 11/10/2026, commit `3087965` (scripts y guías, con ejecución MySQL pendiente). Se utilizó email noreply del usuario de GitHub para no publicar una dirección privada. Sin push forzado ni documentos del grupo. Las actualizaciones documentales posteriores se publican como commits adicionales.

## Reorganización solicitada

Esquema DDL en 01, triggers en 01b y datos DML en 02. Cabeceras y secciones en los siete SQL. Sin cambios de lógica ni ejecución en la BD. Orden nuevo: 00 -> 01 -> 01b -> 02 -> 03 -> 04 -> 05. No repetir instalación sobre la base existente. El backend se ha implementado después, por autorización expresa.
