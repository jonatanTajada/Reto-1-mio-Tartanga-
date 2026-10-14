# Boceto previo al rediseño — 14/10/2026

Este documento se prepara antes de modificar la interfaz. La revisión del ODT y de DIN confirma que simplificar la presentación no cambia los permisos: USER consulta ubicaciones y traslada equipos; ADMIN administra ubicaciones/equipos/cuentas; avisos siguen las reglas finales acordadas. Las contradicciones ya documentadas sobre avisos no se reinterpretan en este bloque.

## Organización propuesta

Una cabecera clara con el nombre de la aplicación, cuenta/rol y cierre de sesión; navegación horizontal estable, sin menú técnico lateral. Conserje: Inventario / Ubicaciones / Avisos. Administrador: esas mismas secciones y Usuarios, con sus acciones autorizadas. Se eliminan los resúmenes de estadísticas para ambos roles, reduciendo también consultas innecesarias en Inventario.

```text
Material del centro — Tartanga       Cuenta · Rol · Cerrar sesión
────────────────────────────────────────────────────────────────
Inventario       Ubicaciones       Avisos       [Usuarios ADMIN]
────────────────────────────────────────────────────────────────
Inventario                         [Crear equipo solo ADMIN]
Consulta dónde está cada equipo y trasládalo cuando lo necesites.

Categoría [Todas las categorías]              [Actualizar lista]
Mensaje de resultado, dentro del flujo y sin tapar controles

Equipos disponibles
Equipo | Marca / modelo | Categoría | Dónde está | Qué puedes hacer
...                             [Ver detalles] [Trasladar equipo]
```

Sin KPI, tarjetas de contadores, adornos de dashboard ni acciones solo con iconos. Los botones especifican la entidad y la acción. Los datos se mantienen en tabla semántica; a 320px/zoom puede desplazarse únicamente su región, con ayuda visible y foco. El resto se adapta a una columna.

## Acceso y formularios

Acceso sencillo en una sola columna: título, instrucciones, usuario, contraseña y botón. Sin ilustración ni panel publicitario. Los formularios y las confirmaciones siguen en diálogo nativo, una columna de campos con etiquetas, ayudas/errores asociados y acciones al final. Cancelar no borra datos. Los nuevos avisos muestran «Crear aviso»; editar muestra «Guardar cambios»; traslado muestra «Confirmar traslado».

## Decisiones de accesibilidad

Azul oscuro sobre superficies claras y neutras, sin depender de rojo/verde. Los estados conservan palabras y bordes. Objetivos de interacción de al menos 44px, contorno de foco oscuro contrastado, mensajes dentro del flujo, sin cabeceras fijas que oculten el foco. Se separan mensajes de resultado y errores locales de formulario para evitar doble anuncio.

Objetivo WCAG 2.2 AA: contraste de texto y controles, teclado, foco, semántica, errores, reflujo y avisos asíncronos. [Reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) contempla la adaptación equivalente a 320 CSS px y excepciones delimitadas para tablas; [contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) y [foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) orientan los controles. No se declara conformidad completa antes de evaluar.

## Verificación prevista

Regresión real de ambos roles y permisos, recorrido por teclado de las operaciones (no solo inspección DOM), diálogo/foco, errores, tabla en móvil, reflujo a 320px y zoom, simulaciones Chrome de protanopia/deuteranopia/tritanopia, contraste calculado y revisión visual de capturas. Comprobar herramientas automáticas disponibles. La prueba con lector de pantalla real y personas debe registrarse como pendiente si el entorno no permite realizarla.
