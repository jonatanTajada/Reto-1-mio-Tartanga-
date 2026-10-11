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
- [ ] Revisión del usuario antes del bloque 2.

Las capturas confirman cinco tablas y siete triggers; 04 terminó con ROLLBACK. Los nueve valores de resultado y los rechazos siguen sin evidencia individual registrada. La validación estática, los enlaces y la conservación de originales se documentan en la guía de pruebas.

## Bloque 2 — Backend, pendiente de aprobación

MVC con DAO y PDO, sin Service: conexión de ejemplo, modelos, rutas, controllers, sesiones, permisos, validación y errores. Módulos de usuarios, equipamientos, ubicaciones, histórico y notificaciones. Separar edición de datos de equipamientos y traslado. Probar HTTP e integridad sin duplicar triggers. Revisar servicios web e integración real de componentes conforme a la rúbrica; JSON por sí solo no acredita todo el criterio. Detenerse para revisión.

## Bloque 3 — Frontend, pendiente de aprobación del backend

HTML semántico, CSS homogéneo y JavaScript modular. Login, navegación por rol, inventario, filtro, CRUD, traslado, histórico y avisos. Guía de estilo, eventos, DOM y asincronía. Pruebas de integración, accesibilidad con herramientas externas y usabilidad con usuarios reales; no afirmar pruebas humanas sin realizarlas. Detenerse para revisión.

## Después

Despliegue Ubuntu Server, documentación de red y acceso desde clase. No autorizado ahora instalar ni configurar el sistema. No se garantiza cumplir todas las rúbricas hasta disponer de la aplicación y sus evidencias.

## Publicación

Antes de inicializar Git se comprobó que la carpeta individual no pertenecía a un repositorio local. `git ls-remote` sobre el repositorio autorizado terminó correctamente sin referencias: remoto vacío en ese momento.

Repositorio local inicializado con rama main y origin vinculado al remoto autorizado. Fetch confirmó que no había ramas remotas. `.gitignore` excluye documentos de clase, archivos privados y dependencias. Comprobación estática PASS: 13 originales intactos, 5 tablas, 7 triggers y enlaces válidos. Instalación original ejecutada por el usuario; nueva separación verificada por comparación de sentencias, sin reinstalar.

Publicación confirmada: primer push de main realizado el 11/10/2026, commit `3087965` (scripts y guías, con ejecución MySQL pendiente). Se utilizó email noreply del usuario de GitHub para no publicar una dirección privada. Sin push forzado ni documentos del grupo. Las actualizaciones documentales posteriores se publican como commits adicionales.

## Reorganización solicitada

Esquema DDL en 01, triggers en 01b y datos DML en 02. Cabeceras y secciones en los siete SQL. Sin cambios de lógica ni ejecución en la BD. Orden nuevo: 00 -> 01 -> 01b -> 02 -> 03 -> 04 -> 05. No repetir instalación sobre la base existente. Backend sin iniciar.
