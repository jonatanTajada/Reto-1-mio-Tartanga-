# Dudas, mejoras y decisiones

Solo se han utilizado documentos de `Documentacion` dentro de la carpeta individual. Se conservan sin modificaciones. Las decisiones siguientes no reescriben el material de clase.

## Contradicciones e interpretaciones

| Fuente y apartado | Problema y consecuencia | Decisión y motivo | Consulta al profesorado |
|---|---|---|---|
| Enunciado PDF pp. 2, 3 y 8; ODT Usuarios | Conserje figura como USER y como CONSERJE; cambia el valor del enum | ADMIN/USER en BD; Conserje como etiqueta. Prioridad a reglas finales y SQL | Pendiente confirmar |
| PDF p. 6 frente a pp. 7–8; ODT Notificaciones | Ambos pueden cambiar estado en un párrafo, pero después solo ADMIN | Estado editable solo por ADMIN; USER edita datos | Pendiente confirmar |
| PNG de casos de uso y `.dio`, nota 4; PDF pp. 7–8 | Diagrama bloquea borrado EN_PROCESO y REALIZADA; texto solo REALIZADA | Permitir borrar EN_PROCESO; bloquear REALIZADA | Pendiente confirmar |
| SVG de casos de uso y diagramas antiguos en `.dio` | Compras, fungibles, stock y categorías gestionables no coinciden con texto ni SQL | No añadir módulos; enum de categorías del SQL | Pendiente aclarar alcance |
| PDF p. 6 y reglas p. 8 | No delimita claramente notificaciones propias/ajenas de USER | Implementado en PHP: USER gestiona las propias; ADMIN consulta todas. No se cambia esquema | Interpretación provisional, pendiente confirmar |
| ODT Gestión de usuarios | Lista aulas en lugar de acciones CRUD | Seguir CRUD del PDF p. 3 | Error editorial, no bloquea |
| ODT Funciones / login | Propone hashear de nuevo para comparar | En backend usar password_hash al guardar y password_verify al autenticar | Corrección técnica |
| ODT Funciones / inventario | Habla de referencia única no presente en SQL ni campos mínimos | Usar id_equipamiento; no imponer nombre único | Pendiente si se pide referencia adicional |
| PDF p. 1 y README del contexto de clase | Grupos de tres frente a reparto de cuatro; versión actual es individual | El reparto sirve de contexto, no limita este proyecto | No altera esquema |

## Cambios respecto al SQL original

| Fuente | Problema / consecuencia | Cambio de trabajo | Naturaleza |
|---|---|---|---|
| `DB/Reto1_DB.sql`, cabecera | Recrea reto_2daw y elimina su contenido | Base exclusiva reto_1_mio; creación inicial sin borrados; preflight de lectura | Límite expreso del usuario |
| `DB/Guia instalacion BD.pdf` pp. 1 y 3 | Describe 4 tablas, 3 triggers y otro nombre de archivo | Guía nueva: 5 tablas y 7 triggers; originales intactos | Corrección documental |
| `DB/Reto1_DB.sql`, textos NOT NULL | NOT NULL permite cadenas vacías | CHECK sobre TRIM; también validación futura en PHP | Mejora, requisito de obligatoriedad interpretado como no vacío |
| SQL, trigger de histórico único | Comprobación previa no sustituye unicidad y solo cubre INSERT | UNIQUE(id_equipamiento, abierto), columna generada 1/NULL; cubre también UPDATE y concurrencia de unicidad | Mejora de integridad |
| SQL, histórico DATETIME | Traslados próximos pueden compartir segundo | DATETIME(6), misma fecha de cierre/apertura y orden por id_historico | Mejora técnica |
| SQL, ubicación Almacén | Se protege borrado pero puede renombrarse y romper altas | Trigger impide renombrar; permite editar descripción | Mejora necesaria para proteger ubicación obligatoria |
| SQL, ON UPDATE CASCADE | Cambios de IDs podrían desajustar histórico sin activar triggers por cascada | ON UPDATE RESTRICT; IDs considerados inmutables por la aplicación | Mejora técnica; revisar con profesora si se exige cascada |
| SQL, histórico ON DELETE CASCADE | Eliminar equipo pierde su histórico | Se conserva cascada para CRUD físico del original; documentar confirmación futura | Pendiente si se exige conservación tras baja |
| INSERT original, usuarios | Hashes sin contraseña de prueba conocida; nombres parecen personas | Tres identidades de demostración y hash bcrypt real verificado | Datos ficticios autorizados |
| INSERT original, IDs fijos y consultas mezcladas | Depende de orden/autoincrementos y mezcla tareas | Recuperar IDs por clave única o LAST_INSERT_ID; scripts separados y transacción | Mejora de reproducibilidad |

No se añade vínculo notificación–equipamiento: el texto pide avisos relacionados con el centro y el original solo relaciona creador; añadirlo sería ampliar el modelo. No se añade tabla de categorías porque se exige enum.

## Límites pendientes

- La BD comprueba que el creador de una notificación sea USER en el alta; no identifica a la persona autenticada que ejecuta una consulta. Todos los permisos reales deben implementarse en PHP.
- Modificar directamente el histórico puede dejar cero intervalos abiertos, cambiar una ubicación o crear solapamientos. El índice garantiza **como máximo uno**, no exactamente uno. No habrá CRUD público del histórico; el DAO lo consultará y los triggers lo escribirán. La cuenta SQL futura debe tener solo SELECT sobre histórico, sin INSERT/UPDATE/DELETE.
- Cambiar rol no reasigna avisos: si un USER pasa a ADMIN, puede consultar todos y cambiar estado, pero ya no editar contenido como USER. No se permite transferir autoría por el API.
- El original y los scripts nuevos no crean cuentas SQL ni privilegios. La cuenta de runtime se preparará sin publicar credenciales.
- El usuario ejecutó instalación/datos y consultas en Workbench, según capturas. El agente no ha reinstalado SQL. Tras configurar las credenciales privadas, se comprobaron conexión PDO, 115 respuestas HTTP y ocho consultas de integridad/limpieza; las colecciones e históricos existentes se conservaron.
- Rubrica DWS RA7+RA9 (15%): planificar servicio web e integración funcional externa; no darlo por completo solo por devolver JSON.
- No hay rúbricas independientes de cliente, despliegue y ciberseguridad en la copia; revisar entregas de Moodle.
- El mapa mental se entrega como fuente Markdown. No se instala Markmap ni se cargan scripts remotos.

## Organización de scripts y evidencias nuevas

A petición del usuario se separan triggers en 01b, manteniendo esquema en 01 y DML de demostración en 02. Almacén permanece como dato inicial obligatorio junto al esquema, porque no es un dato de prueba. DDL/DML describen tipos de sentencias; la separación por archivos es una convención de organización, no un requisito del motor ni de la rúbrica. No se cambia lógica ni se reejecuta instalación.

Las capturas del usuario confirman instalación original, carga y consultas de integridad sin inconsistencias; 04 llegó a ROLLBACK. El usuario comunica funcionamiento correcto. No hay evidencia visual de nueve PASS ni de rechazos individuales. La advertencia sobre BINARY se conserva pendiente porque ahora solo se solicitan comentarios y organización.

## Decisiones del backend individual

- MVC sin Service: auxiliares HTTP técnicos, modelos sencillos con validación, DAO con SQL y controladores con permisos/transacciones. La API representa JSON y la interfaz HTML/CSS/JS se sirve desde `public`.

## Decisiones y pendientes del frontend

- Interfaz nativa del mismo origen, sin librerías/CDN ni recursos remotos. Etiquetas Administrador/Conserje, enums internos sin cambiar.
- Navegación por fragmento URL, formularios y detalle en diálogo nativo; tablas semánticas con desplazamiento interno en móvil.
- La interfaz muestra controles por rol, pero los permisos reales siguen en PHP. No se ofrecen ubicación al crear equipo, autor/estado en aviso USER ni CRUD de histórico.
- Chrome reveló una carrera del arranque de sesión por rutas desconocidas; la entrada PHP ahora valida ruta y método antes de iniciar sesión. Se conserva CSRF y se añade prueba de regresión.
- Evidencia final: 32 comprobaciones UI con datos reales, 116 respuestas HTTP, ocho controles de integridad y ocho pares de contraste. Datos/históricos anteriores conservados.
- El árbol accesible Chrome, foco, labels y contraste no certifican WCAG completo. Validadores HTML/CSS externos, lector de pantalla y pruebas con personas siguen pendientes.
- No hay una rúbrica técnica independiente de Cliente en la copia: se siguen RA1/RA5/RA6/RA7 del enunciado; confirmar entregas adicionales de Moodle.
- RA9 externo, contradicciones de clase, concurrencia, HTTPS/rate limiting y despliegue Ubuntu siguen abiertos. No se presenta una nota ni se instalan dependencias.
- Sesión revalidada en MySQL por operación; cambiar contraseña invalida sesiones anteriores. Roles no se aceptan del cliente salvo el CRUD de usuarios ADMIN.
- CSRF en toda escritura, incluido login; obtener token público antes de autenticar. Cookies HttpOnly y SameSite Strict; Secure en HTTPS.
- ADMIN no puede eliminar/degradar su cuenta y se conserva al menos un ADMIN mediante bloqueo transaccional. Recomendación adicional para evitar perder administración.
- USER puede editar contenido de un aviso REALIZADA y ADMIN puede volver a cambiar estado: el requisito prohíbe borrarlo, no esas operaciones. Si la profesora exige inmutabilidad, habrá que cambiar esta política.
- No se fuerza zona SQL: se conserva la del servidor porque los DATETIME de Workbench ya existen y no incorporan zona. Política horaria común pendiente de despliegue.
- La rúbrica RA7+RA9 exige servicio e integración externa. API y flujos completos probados contra MySQL; biblioteca/componente externo no integrado. Propuesta para debatir: exportación de inventario con una biblioteca mantenida, si se acepta en alcance. No se dan por acreditados todos los criterios.
- Límite de login por sesión implementado, insuficiente frente a cambio de cookies; rate limiting por IP y TLS pendientes del servidor real.
- Credenciales configuradas por el usuario en su archivo local excluido de Git; conexión comprobada sin mostrarlas. El ejemplo público permanece sin secretos. No se han supuesto claves ni solicitado contraseñas por chat.

## Ampliación de pruebas con conexión local

No aparecieron fallos funcionales en los escenarios ejecutados. Se corrigió el contador del cliente de pruebas, que inicialmente no sumaba dos peticiones de otro cliente anónimo, y se amplió la cobertura de denegaciones, cambio de rol en sesión vigente y conservación del histórico existente. Se añadió `tools/comprobar_integridad.php`, exclusivamente de lectura. Resultado final: 3 usuarios, 4 ubicaciones, 5 equipamientos, 7 intervalos de histórico y 3 notificaciones; cero filas temporales. Los AUTO_INCREMENT no se reinician y pueden tener huecos.
