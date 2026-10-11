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
- [ ] Ejecutar SQL: conexión rechazada por falta de credenciales disponibles.
- [ ] Confirmar en Workbench si existe `reto_1_mio` y su contenido antes de crear nada.
- [ ] Ejecutar pruebas 04 y 05 y registrar resultados reales.
- [ ] Revisión del usuario antes del bloque 2.

Los scripts están preparados; no se afirma que las tablas o triggers existan en el servidor. La validación estática, los enlaces y la conservación de originales se documentan en la guía de pruebas.

## Bloque 2 — Backend, pendiente de aprobación

MVC con DAO y PDO, sin Service: conexión de ejemplo, modelos, rutas, controllers, sesiones, permisos, validación y errores. Módulos de usuarios, equipamientos, ubicaciones, histórico y notificaciones. Separar edición de datos de equipamientos y traslado. Probar HTTP e integridad sin duplicar triggers. Revisar servicios web e integración real de componentes conforme a la rúbrica; JSON por sí solo no acredita todo el criterio. Detenerse para revisión.

## Bloque 3 — Frontend, pendiente de aprobación del backend

HTML semántico, CSS homogéneo y JavaScript modular. Login, navegación por rol, inventario, filtro, CRUD, traslado, histórico y avisos. Guía de estilo, eventos, DOM y asincronía. Pruebas de integración, accesibilidad con herramientas externas y usabilidad con usuarios reales; no afirmar pruebas humanas sin realizarlas. Detenerse para revisión.

## Después

Despliegue Ubuntu Server, documentación de red y acceso desde clase. No autorizado ahora instalar ni configurar el sistema. No se garantiza cumplir todas las rúbricas hasta disponer de la aplicación y sus evidencias.

## Publicación

Antes de inicializar Git se comprobó que la carpeta individual no pertenecía a un repositorio local. `git ls-remote` sobre el repositorio autorizado terminó correctamente sin referencias: remoto vacío en ese momento.

Repositorio local inicializado con rama main y origin vinculado al remoto autorizado. Fetch confirmó que no había ramas remotas. `.gitignore` excluye documentos de clase, archivos privados y dependencias. Comprobación estática PASS: 13 originales intactos, 5 tablas, 7 triggers y enlaces válidos. Ejecución SQL pendiente; el bloque está preparado para revisión, no certificado como ejecutado.

Publicación: pendiente de confirmar el primer push. La falta de ejecución SQL seguirá visible en el README y en el commit publicado.
