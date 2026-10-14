# Plan y estado

Fecha de revisión: 14 de octubre de 2026.

## Rediseño sencillo y accesible — 14/10/2026

- [x] Releer ODT/DIN y revisar permisos efectivos: ADMIN, USER, USER; sin cambios de rol.
- [x] Preparar boceto y justificación antes de modificar la interfaz.
- [x] Retirar menú lateral, ilustración de acceso y tarjetas de resumen; navegación por tareas y acciones explícitas.
- [x] Mantener todos los módulos, permisos PHP, fetch y CSRF; sin Service/framework/CDN.
- [x] Errores asociados a campos, anuncios sin duplicación, foco restaurado tras recarga y controles de al menos 44px.
- [x] 44 comprobaciones Chrome con 420 pasos Tab, Enter y escritura nativa; flujos completos de ambos roles.
- [x] Ampliación de texto 200%, reflujo equivalente 400%, móvil/escritorio y tres simulaciones de daltonismo revisadas.
- [x] Diez pares de texto >=4.5:1 y cuatro de controles >=3:1.
- [x] 12 perfiles/controles independientes, 44 HTTP del caso y 118 HTTP de regresión.
- [x] Ocho controles finales de integridad correctos; 3 usuarios, 5 ubicaciones, 6 equipos, 8 intervalos y 3 avisos conservados, incluidos I+D+I. Trece originales intactos.
- [ ] Zoom nativo 400%, lector de pantalla real, auditoría completa WCAG/HTML/CSS y pruebas con personas.
- [ ] Revisión del usuario; no configurar Ubuntu.

Ver [boceto previo](frontend/BOCETO_REDISENO_2026_10_14.md) y [resultados/límites](frontend/ACCESIBILIDAD_Y_PRUEBAS.md). La emulación de reflujo y el árbol accesible no se presentan como pruebas humanas o de lector real.

## Revisión posterior — Permisos de Ubicaciones

- [x] Revisar ODT/enunciado/rúbrica y controlador: CRUD ADMIN; consulta/traslado USER.
- [x] Diagnóstico previo: cuenta `conserje_demo` tenía ADMIN; sesión reciente ID 2.
- [x] Restablecer solo su rol demo USER; conservar «I+D+I» y datos anteriores.
- [x] Mapa de permisos, guardia de formulario, identificación en login y sincronización de perfil tras 403.
- [x] 44 respuestas HTTP del caso con cookies independientes y comparación tras cada rechazo.
- [x] 12 comprobaciones Chrome en perfiles separados, incluido cambio de rol con formulario abierto.
- [x] Regresión general: 118 respuestas HTTP; ocho controles finales de integridad correctos.
- [x] Conservar corrección local del selector CSS `button:disabled`.
- [ ] Revisión del usuario. No avanzar a otro bloque.

Ver [informe del caso](backend/REVISION_PERMISOS_UBICACIONES.md). No se reinstaló la base ni se borró la ubicación reportada. El cambio de rol no puede atribuirse retrospectivamente sin auditoría.

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

## Bloque 2 — Backend implementado y probado con MySQL

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
- [x] Usuario configuró credenciales en `config/database.local.php`; exclusión Git comprobada.
- [x] Conexión PDO correcta, exclusivamente a `reto_1_mio`.
- [x] Prueba HTTP ampliada: 115 respuestas correctas, CRUD y permisos de ambos roles.
- [x] Comparar colecciones e históricos anteriores/después; datos conservados.
- [x] Ocho consultas de integridad/limpieza correctas; ninguna fila temporal restante.
- [ ] Componente externo RA9 funcional, sujeto a concretar integración útil dentro del alcance.
- [x] Usuario aprobó backend y autorizó frontend completo.

No se recreó la base, no se instaló software ni se modificó documentación oficial. El bloque backend fue aprobado y el frontend se desarrolló después por autorización expresa. Véase [evidencia del backend](backend/PRUEBAS_Y_ESTADO.md).

## Bloque 3 — Frontend implementado e integrado

- [x] Leer DIN y resultados de Cliente del enunciado; fuentes oficiales intactas.
- [x] HTML5, CSS propio y módulos JavaScript nativos, sin framework/CDN/compilación.
- [x] Bocetos editables, guía de estilo, navegación por rol y adaptación.
- [x] Acceso/cierre, inventario/filtro, detalle/histórico, equipos, traslados, ubicaciones, avisos y usuarios.
- [x] Fetch del mismo origen, sesión y CSRF, validación, carga, mensajes, estados vacíos y confirmaciones.
- [x] Ajustar entrada PHP para servir frontend y corregir sesión en rutas desconocidas.
- [x] Chrome real: 32 comprobaciones, CRUD desde formularios, roles, texto seguro, teclado y red.
- [x] Tamaños 320/390/768/1440 px y formulario móvil comprobados.
- [x] Regresión API tras integración: 116 respuestas HTTP correctas.
- [x] Integridad y limpieza de datos de pruebas backend/frontend: ocho controles correctos.
- [x] Revisión de contraste para ocho pares, labels/IDs y árbol accesible Chrome.
- [x] Capturas reales de acceso, escritorio y móvil; datos existentes conservados.
- [ ] Validación externa formal HTML/CSS y auditoría completa WCAG/lector de pantalla.
- [ ] Pruebas con personas reales y otros navegadores/dispositivos.
- [ ] Revisión del usuario antes de siguiente bloque.

La documentación distingue evidencias técnicas de pruebas humanas. Ver [guía frontend](frontend/GUIA_FRONTEND_ESTRUCTURA_Y_FUNCIONAMIENTO.md). No se promete una nota ni conformidad WCAG global. No se configura Ubuntu.

## Después

Despliegue Ubuntu Server, documentación de red y acceso desde clase. No autorizado ahora instalar ni configurar el sistema. No se garantiza cumplir todas las rúbricas hasta disponer de la aplicación y sus evidencias.

## Publicación

Antes de inicializar Git se comprobó que la carpeta individual no pertenecía a un repositorio local. `git ls-remote` sobre el repositorio autorizado terminó correctamente sin referencias: remoto vacío en ese momento.

Repositorio local inicializado con rama main y origin vinculado al remoto autorizado. Fetch confirmó que no había ramas remotas. `.gitignore` excluye documentos de clase, archivos privados y dependencias. Comprobación estática PASS: 13 originales intactos, 5 tablas, 7 triggers y enlaces válidos. Instalación original ejecutada por el usuario; nueva separación verificada por comparación de sentencias, sin reinstalar.

Publicación confirmada: primer push de main realizado el 11/10/2026, commit `3087965` (scripts y guías, con ejecución MySQL pendiente). Se utilizó email noreply del usuario de GitHub para no publicar una dirección privada. Sin push forzado ni documentos del grupo. Las actualizaciones documentales posteriores se publican como commits adicionales.

Backend inicial publicado en `dc968c5`, con falta de configuración local documentada en aquel momento. Tras configurar el usuario sus credenciales privadas, se ha comprobado conexión y prueba completa; las nuevas evidencias sustituyen esa limitación anterior. No se publican credenciales ni sesiones.

## Reorganización solicitada

Esquema DDL en 01, triggers en 01b y datos DML en 02. Cabeceras y secciones en los siete SQL. Sin cambios de lógica ni ejecución en la BD. Orden nuevo: 00 -> 01 -> 01b -> 02 -> 03 -> 04 -> 05. No repetir instalación sobre la base existente. El backend se ha implementado después, por autorización expresa.
