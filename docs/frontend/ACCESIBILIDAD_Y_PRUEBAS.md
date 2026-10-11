# Accesibilidad, pruebas y rúbricas

Evidencia del 11/10/2026. La aplicación se probó con la API PHP y MySQL reales. No se utilizaron mocks como sustituto de integración.

## Pruebas realizadas

| Herramienta | Comprobación | Resultado |
|---|---|---|
| Node `--check` | Sintaxis de los nueve módulos JS y herramienta de navegador | Sin errores |
| Chrome headless y CDP nativo | Flujo real de ambos roles, formularios, CRUD, confirmaciones, filtro e histórico | 32 comprobaciones correctas; sin excepciones JavaScript no controladas |
| Chrome / Network CDP | Desconexión de red simulada y recuperación con Actualizar | Error comprensible y recuperación comprobados |
| Chrome / Accessibility CDP | Árbol accesible con regiones main/navigation | Regiones presentes; no es auditoría WCAG completa |
| Chrome / Input CDP | Tab, Escape y devolución del foco en diálogo | Comprobados en los pasos automatizados |
| Chrome / métricas del viewport | Escritorio 1440px, móvil 390px, mínimo 320px y tablet 768px | Sin desbordamiento horizontal de página en pantallas comprobadas; tablas desplazables dentro de su región |
| Chrome DOM | Campos de formulario móvil etiquetados y sin desbordamiento del diálogo | Comprobado |
| Python `revisar_frontend.py` | IDs, etiquetas estáticas, recursos locales, inserción segura DOM y ocho pares de contraste | Correcto; contrastes entre 6.24:1 y 14.23:1 |
| Python cliente HTTP | Regresión completa de API, incluida ruta desconocida sin cookie de sesión | 116 respuestas HTTP correctas |
| PHP de integridad | Intervalos, ubicación actual y residuos de pruebas backend/frontend | Ocho controles correctos; 3 usuarios, 4 ubicaciones, 5 equipos, 7 intervalos y 3 avisos |

Los escenarios de Chrome incluyen alta/edición/eliminación de equipos, ubicaciones y usuarios, avisos propios, cambio de estado ADMIN, borrado EN_PROCESO y bloqueo visual REALIZADA, detalle e historial, filtro, cancelación de borrado, cierre de sesión y sesión invalidada en el servidor. Los datos e históricos anteriores se comparan y conservan. Las excepciones JavaScript no controladas hacen fallar el cliente.

Se corrigió el arranque de sesión en rutas desconocidas, se ajustó la adaptación de textos largos y se corrigieron las esperas/foco del cliente de automatización. No se relajaron permisos ni validaciones para hacer pasar pruebas.

## Accesibilidad aplicada

HTML en español, navegación y main semánticos, jerarquía de encabezados, etiquetas visibles, ayuda asociada, caption y scope en tablas, nombres textuales de acciones, foco visible, salto al contenido, diálogo nativo y estados anunciados. Color acompañado de texto; no hay interacción exclusiva con hover. El SVG decorativo informativo tiene nombre accesible. Se utilizaron fuentes del sistema y no se cargan recursos remotos.

No se afirma conformidad global AA/AAA. Los contrastes calculados son una muestra de pares del diseño, no una inspección de todos los contextos/renderizados. Tab/Escape son pasos automatizados, no una revisión exhaustiva de cada secuencia de teclado. El árbol de Chrome es una herramienta externa real, pero no equivale a verificar todo WCAG con un lector de pantalla.

## Correspondencia con lo copiado de clase

Fuente: `Documentacion/Rúbricas/1DAM Rubrica Tecnica DIN.pdf`, conservada intacta. Cliente: enunciado `2DAW_RetoAlumnado_Reto1.pdf`, p. 10. No hay rúbrica técnica independiente de Cliente en la copia; las entregas específicas de Moodle siguen pendientes de confirmar.

| Criterio | Implementación/evidencia | Pendiente |
|---|---|---|
| DIN RA1: planificación | Bocetos editables, guía de estilo justificada y estructura de pantallas | Revisión del diseño por el usuario/profesora |
| DIN RA2: homogeneidad | CSS externos organizados, tokens y componentes reutilizables | Validación formal HTML/CSS con validador externo; revisión completa de todas sus reglas |
| DIN RA5: accesibilidad | Semántica, foco, etiquetas, contraste y comprobación Chrome | Auditoría completa WCAG, lector de pantalla y pruebas en otros navegadores |
| DIN RA6: usabilidad | Navegación por rol, estados, confirmaciones, responsive | **Tests con usuarios reales no realizados**; no se acredita ese nivel de la rúbrica |
| Cliente RA1 | HTML/CSS/JS nativos y mismo origen, decisiones documentadas | Criterios adicionales de Moodle si existen |
| Cliente RA5 | Eventos submit/input/change/click/hashchange y diálogo | Evidencia de defensa individual |
| Cliente RA6 | DOM seguro y construcción dinámica de listas/formularios | Sin auditoría exhaustiva de todos los escenarios |
| Cliente RA7 | Fetch real, sesión/CSRF, carga, errores y recuperación | Pruebas de red/carga adicionales y despliegue |

La integración externa backend RA9 continúa pendiente: no se añaden librerías de interfaz para simular su cumplimiento. Tampoco se ha configurado Ubuntu, Apache, HTTPS, limitación por IP ni pruebas de concurrencia.
