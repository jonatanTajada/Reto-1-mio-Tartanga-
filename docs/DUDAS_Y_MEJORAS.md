# Dudas, mejoras y decisiones

Solo se han utilizado documentos de `Documentacion` dentro de la carpeta individual. Se conservan sin modificaciones. Las decisiones siguientes no reescriben el material de clase.

## Contradicciones e interpretaciones

| Fuente y apartado | Problema y consecuencia | Decisión y motivo | Consulta al profesorado |
|---|---|---|---|
| Enunciado PDF pp. 2, 3 y 8; ODT Usuarios | Conserje figura como USER y como CONSERJE; cambia el valor del enum | ADMIN/USER en BD; Conserje como etiqueta. Prioridad a reglas finales y SQL | Pendiente confirmar |
| PDF p. 6 frente a pp. 7–8; ODT Notificaciones | Ambos pueden cambiar estado en un párrafo, pero después solo ADMIN | Estado editable solo por ADMIN; USER edita datos | Pendiente confirmar |
| PNG de casos de uso y `.dio`, nota 4; PDF pp. 7–8 | Diagrama bloquea borrado EN_PROCESO y REALIZADA; texto solo REALIZADA | Permitir borrar EN_PROCESO; bloquear REALIZADA | Pendiente confirmar |
| SVG de casos de uso y diagramas antiguos en `.dio` | Compras, fungibles, stock y categorías gestionables no coinciden con texto ni SQL | No añadir módulos; enum de categorías del SQL | Pendiente aclarar alcance |
| PDF p. 6 y reglas p. 8 | No delimita claramente notificaciones propias/ajenas de USER | Propuesta: USER gestiona las propias; no implementado en BD | Pendiente decidir antes del backend |
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
- Cambios posteriores de rol del creador y transferencias de autoría requieren una política en backend; no se añaden restricciones que impidan CRUD sin una decisión explícita.
- El original y los scripts nuevos no crean cuentas SQL ni privilegios. La cuenta de runtime se preparará sin publicar credenciales.
- SQL no ejecutado: no se pudo comprobar esquema existente, compatibilidad real del servidor, resultados de triggers ni concurrencia. Requiere Workbench.
- Rubrica DWS RA7+RA9 (15%): planificar servicio web e integración funcional externa; no darlo por completo solo por devolver JSON.
- No hay rúbricas independientes de cliente, despliegue y ciberseguridad en la copia; revisar entregas de Moodle.
- El mapa mental se entrega como fuente Markdown. No se instala Markmap ni se cargan scripts remotos.

## Organización de scripts y evidencias nuevas

A petición del usuario se separan triggers en 01b, manteniendo esquema en 01 y DML de demostración en 02. Almacén permanece como dato inicial obligatorio junto al esquema, porque no es un dato de prueba. DDL/DML describen tipos de sentencias; la separación por archivos es una convención de organización, no un requisito del motor ni de la rúbrica. No se cambia lógica ni se reejecuta instalación.

Las capturas del usuario confirman instalación original, carga y consultas de integridad sin inconsistencias; 04 llegó a ROLLBACK. El usuario comunica funcionamiento correcto. No hay evidencia visual de nueve PASS ni de rechazos individuales. La advertencia sobre BINARY se conserva pendiente porque ahora solo se solicitan comentarios y organización.
