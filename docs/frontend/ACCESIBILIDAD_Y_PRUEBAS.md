# Accesibilidad y pruebas — rediseño 14/10/2026

Objetivo de trabajo: **WCAG 2.2 AA**, sin declaración de conformidad completa. Se revisó la rúbrica DIN y el ODT antes de implementar; la rúbrica pide evidencia externa de accesibilidad y pruebas de usabilidad con personas para sus niveles altos. Estas comprobaciones técnicas no sustituyen ese requisito humano.

## Herramientas y alcance

Chrome headless instalado, CDP, Node nativo y Python local. No se instaló software ni una biblioteca de interfaz. axe-core no estaba disponible localmente y no se ha ejecutado axe. El árbol accesible de Chrome se utiliza como inspección técnica; **no es una prueba con lector de pantalla**.

El cliente permite `node tools/probar_frontend.mjs --teclado`: busca controles con Tab, los activa con Enter y escribe mediante entrada nativa. Los selectores sirven para comprobar dónde llega el foco, no para enfocarlo por DOM en ese modo. Las pruebas de estado de sesión/red y limpieza utilizan la API real para preparar condiciones y comparar datos.

## Comprobaciones del rediseño

| Área | Evidencia técnica |
|---|---|
| Flujos completos | Acceso/cierre, navegación, filtro, detalle/historial, CRUD de equipo/ubicación/usuario, aviso propio y cambio de estado ADMIN, traslado y confirmaciones |
| Teclado | Tab/Enter, escritura nativa, selectores con Home/flechas, Escape; todos los flujos anteriores sin ratón |
| Foco | Comprobar que cada parada de Tab intersecta el viewport y no queda cubierta; foco visible; recuperación al cerrar diálogo |
| Validación | Texto de error asociado al campo, aria-invalid y foco en primer error; sin alerta global duplicada |
| Semántica | HTML en español, main/nav, encabezados, campos etiquetados, scope=row/col, caption; ningún tabindex positivo |
| Contraste | Diez pares de texto >=4.5:1 y cuatro de controles/foco >=3:1; mínimo observado 6.76:1 y 5.32:1 respectivamente |
| Adaptación | 320/390/768/1440px, formulario estrecho, tabla en región desplazable |
| Ampliación | Texto al 200% y viewport 320 × 225 para reflujo equivalente a 1280 × 900 al 400%; diálogo y navegación conservados |
| Daltonismo | Chrome emula protanopia, deuteranopia y tritanopia; acciones siguen teniendo texto; capturas inspeccionadas visualmente |
| Mensajes/red | Desconexión simulada de transporte y recuperación real; sesión revocada en el servidor vuelve al acceso |
| Permisos | Conserje sin resumen/usuarios/edición de equipos ni CRUD de ubicaciones; traslado conservado; API sigue autorizando |
| Datos | Fixtures propios y limpieza por ID; comparación de colecciones e históricos anteriores |

Resultados finales de la ejecución de cierre se registran en el plan y la entrega. Los recuentos HTTP varían según los equipos existentes porque se consulta su histórico antes/después.

Los errores de carga en «Ver detalles» y «Trasladar equipo» se comprobaron dentro del diálogo, sin alertas globales duplicadas. Una comprobación de integridad lanzada durante las pruebas detectó los cuatro registros temporales todavía en uso; al finalizar y limpiar las pruebas se repitió y pasaron los ocho controles. La integridad final debe comprobarse después de las pruebas, no mientras crean sus datos aislados.

Ejecución final: **44 comprobaciones UI y 420 pasos Tab**, **12 comprobaciones de perfiles independientes**, **44 respuestas HTTP del caso de Ubicaciones**, **118 respuestas de regresión**. Ocho controles de integridad correctos y trece originales intactos. Se conservan 3 usuarios, 5 ubicaciones (incluida I+D+I), 6 equipos, 8 intervalos y 3 avisos, sin residuos de pruebas. La inspección visual cubrió acceso/escritorio/móvil y las tres capturas de daltonismo; el árbol accesible Chrome se inspeccionó técnicamente. No se hizo una revisión manual exhaustiva de WCAG ni una prueba de voz.

Se corrigieron dos problemas del cliente de automatización: Enter necesitaba texto de retorno en CDP, y Tab al final de una página puede pasar a la barra del navegador (eso no es una trampa). No se cambió la aplicación para impedir esa salida normal. Se añadió una búsqueda por Tab de un control concreto.

## Criterios de referencia y límites

| Criterio | Medida aplicada / comprobada | Límite |
|---|---|---|
| 1.3.1 / 4.1.2 | Etiquetas, regiones, encabezados y tabla nativos; nombres de acciones incluyen registro | Inspección Chrome, no lectura de voz real |
| 1.4.1 | Estado/acción con palabras; ninguna decisión depende solo del color | Simulación no prueba experiencias individuales |
| 1.4.3 / 1.4.11 | Contraste de pares de texto/control/foco calculado | Muestra del diseño, no auditoría de cada píxel/estado |
| 1.4.4 / 1.4.10 | Texto 200%, reflujo equivalente 400% y región de tabla | **Zoom nativo mediante la interfaz del navegador pendiente** |
| 2.1.1 / 2.1.2 | Flujos por teclado, diálogo con Escape y bloqueo de doble envío | No prueba todos los navegadores ni tecnologías de apoyo |
| 2.4.1 / 2.4.3 / 2.4.7 / 2.4.11 | Salto, orden natural, foco visible sin banners superpuestos | Pendiente revisión exhaustiva humana |
| 2.5.8 | Mínimo 44px en botones/enlaces de navegación/controles | Verificar todos los periféricos con personas |
| 3.3.1 / 3.3.2 | Instrucciones, mensajes vinculados y foco en error | Falta validación con lector de pantalla |
| 4.1.3 | Regiones estables; errores locales y éxito tras cerrar diálogo | Inspección técnica no garantiza anuncio en todas las combinaciones AT/navegador |

Fuentes primarias: [WCAG 2.2 y documentos de comprensión](https://www.w3.org/WAI/WCAG22/Understanding/), [reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) y [foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). [Emulación Chrome](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/) documenta las simulaciones.

## Pendientes reales

- Prueba con NVDA, Narrador, VoiceOver u otro **lector real**: no realizada; no se afirma disponer de evidencia de voz.
- Pruebas con personas, incluidas baja visión/daltonismo/usuarios de lectores: no realizadas.
- Zoom nativo a 400%, otros navegadores y periféricos, validación formal externa HTML/CSS y auditoría WCAG completa.
- RA9 externo del backend, despliegue Ubuntu/TLS y pruebas de concurrencia.

DIN RA1 se apoya en el boceto previo y guía; RA2 en CSS propios/componentes; RA5 en verificaciones documentadas con límites; RA6 sigue requiriendo pruebas humanas. Cliente RA5/RA6/RA7 mantiene eventos, DOM y fetch real. No se promete una nota.

[Boceto previo](BOCETO_REDISENO_2026_10_14.md) · [Capturas](PANTALLAS_Y_BOCETOS.md) · [Ejecución](EJECUCION_Y_RECORRIDO.md)
