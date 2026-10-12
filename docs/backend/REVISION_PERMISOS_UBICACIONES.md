# Revisión de permisos de Ubicaciones — 12/10/2026

## Qué establece la documentación oficial

`Documentacion/Reto_1_Planteamiento.odt`, apartado Gestión de ubicaciones: el Administrador tiene CRUD; el Conserje consulta, sin crear/modificar/eliminar ubicaciones, y puede cambiar la ubicación de equipamientos. El enunciado PDF, pp. 4, 7 y 8, coincide. La rúbrica DWS exige autorización y reglas ADMIN/USER en el servidor. La rúbrica DIN orienta presentación y accesibilidad, no concede permisos adicionales. No se encontró contradicción en esta regla; las contradicciones sobre nombres de roles y avisos siguen registradas aparte.

## Causa observada

Antes de modificar datos, MySQL mostraba `conserje_demo` (ID 2) con **ADMIN**, aunque su definición de demostración y nuestras guías le asignan USER. El archivo de sesión autenticado más reciente tenía ese mismo ID; el backend consulta su rol actual en cada petición. Por tanto, esa cuenta tenía permisos reales de Administrador. No se reprodujo creación de ubicaciones con una sesión efectiva USER.

`nombre_usuario` identifica la cuenta; no fija sus permisos. Una cuenta llamada conserje puede tener ADMIN si ese es el rol guardado. No se cambia el backend para inferir roles por nombres.

No hay auditoría histórica que indique quién/cuándo/cómo cambió el rol ni quién creó «I+D+I». No puede demostrarse retrospectivamente la cookie exacta de la pestaña del usuario leyendo solo archivos de sesión. La cuenta/rol y la sesión reciente son evidencia local compatible con el caso; la autoría de cambios anteriores no se atribuye sin pruebas.

## Correcciones aplicadas

- Restablecido exclusivamente `conserje_demo.rol` a USER, conservando `admin_demo` ADMIN. No se cambió contraseña, identidad ni registros existentes de ubicación/equipamiento/avisos/histórico.
- Mapa explícito de permisos de alta en la interfaz; Ubicaciones requiere ADMIN.
- Guardia adicional al abrir formulario de ubicación; la autorización definitiva permanece en PHP.
- Login informa cuenta y rol efectivo. Un 403 ahora revalida identidad y actualiza perfil/controles; cierra formularios con permisos antiguos si cambió cuenta/rol.
- PHP ya exigía ADMIN antes de leer/validar/escribir el cuerpo de POST/PUT/DELETE; se añadieron comentarios que explican la separación respecto al traslado USER. No se relajó esa autorización.
- Conservada e incorporada la corrección local existente de `button:disabled` en `base.css`. El selector publicado anteriormente estaba mal formado; no era la causa de autorización de ubicaciones.

Herramientas de mantenimiento: `tools/diagnosticar_roles.php` es solo lectura y nunca imprime cookies, CSRF, hashes ni contraseñas. `tools/corregir_rol_demo.php` es una corrección puntual de la cuenta ficticia, **solo escribe con `--aplicar`**. No se ejecuta al arrancar ni impone roles por nombre en producción. No debe usarse para restablecer automáticamente decisiones futuras legítimas de administración.

## Pruebas realmente ejecutadas

| Prueba | Resultado |
|---|---|
| Diagnóstico PDO previo | ID 2 ADMIN y «I+D+I» existente; solo lectura |
| Corrección puntual | ID 2 USER; ID 1 continúa ADMIN |
| `python tools/probar_permisos_ubicaciones.py` | 44 respuestas correctas, con CookieJar independientes para las cuentas demo |
| USER: GET ubicaciones | 200 |
| USER: POST/PUT/DELETE con CSRF válido | 403; comparación de listado después de **cada** intento confirma ausencia de cambios |
| ADMIN: crear/leer/editar/borrar destino temporal | 201/200, sin tocar destinos existentes |
| USER: traslado de equipo temporal | 200; dos intervalos, destino correcto, continuidad y uno actual |
| `node tools/probar_sesiones_ubicaciones.mjs` | 12 comprobaciones correctas con dos procesos/perfiles Chrome independientes |
| Perfil y controles | USER mostrado como Conserje, sin alta/edición/borrado de ubicaciones; ADMIN con CRUD; USER con Trasladar |
| Cambio de rol de cuenta temporal mientras su formulario estaba abierto | Escritura rechazada; perfil actualizado a Conserje, formulario cerrado, sin ubicación creada |
| Regresión `python tools/probar_http.py --completo` | 118 respuestas correctas con el inventario actual |
| Sintaxis PHP/JS afectados y revisión estática | Correctas |
| Integridad final | Ocho controles correctos; cero residuos de pruebas |

Recuento final: **3 usuarios, 5 ubicaciones, 6 equipos, 8 intervalos y 3 avisos**. «I+D+I» (ID 17) se conserva. Las pruebas comparan todos los datos anteriores y los históricos; solo eliminan sus filas temporales. La única modificación deliberada de datos previos fue restablecer el rol de la cuenta demo. No se recreó ni reinstaló la base.

La cifra de peticiones del cliente general depende del número de equipos: incluye lectura del histórico de cada equipo antes/después. Las 116 respuestas del 11/10 y las 118 de esta revisión corresponden a conjuntos de datos distintos, no a una discrepancia de permisos.

## Cómo comprobarlo en tu navegador

Recarga la página o pulsa Actualizar: el rol corregido se relee de MySQL. Confirma la cuenta y la etiqueta del perfil. Para comparar simultáneamente ADMIN y USER, utiliza perfiles o navegadores separados: **dos pestañas del mismo perfil comparten la cookie**, y un login cambia la cuenta efectiva de ese perfil.

Pendientes anteriores: auditoría completa de accesibilidad, pruebas humanas, RA9 externo, concurrencia y despliegue. No se repitieron todas las 32 pruebas generales de interfaz en esta revisión; se ejecutaron las 12 específicas y la regresión HTTP indicada.
