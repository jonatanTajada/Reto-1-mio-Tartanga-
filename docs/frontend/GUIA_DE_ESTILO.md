# Guía de estilo — rediseño 14/10/2026

La aplicación organiza tareas, no estadísticas. Cabecera y navegación horizontal comunes, listas sencillas y acciones explícitas según rol. Se retiran menú lateral, ilustración de acceso, tarjetas de resumen y adornos de dashboard. El Conserje ve Inventario, Ubicaciones y Avisos; el Administrador añade Usuarios y sus controles.

## Colores y contraste

| Uso | Color |
|---|---|
| Fondo cálido / superficie | `#faf8f3` / `#ffffff` |
| Texto / texto secundario | `#202d3a` / `#4c5966` |
| Acción principal | `#254c74` |
| Borde de entrada y controles | `#596978` |
| Foco | `#102e50` |
| Error y eliminación | `#922535` |
| Pendiente | Texto `#624b12`, fondo `#fff7e4` |
| En proceso | Texto `#29496d`, fondo `#edf2fa` |
| Realizada | Texto `#263847`, fondo `#f1f3f5` |

No se depende de rojo/verde: cada estado tiene su palabra; eliminar tiene una acción explícita y confirmación. Los colores se revisan con simulaciones, sin confundirlas con una prueba con personas.

El comprobador calcula diez pares de texto (mínimo observado **6.76:1**; todos superan 4.5:1) y cuatro pares no textuales (mínimo **5.32:1**; todos superan 3:1). Comprueba que los colores de texto sigan presentes en CSS. No equivale a medir todos los píxeles ni a certificar WCAG.

## Tipografía y espaciado

Fuentes del sistema, sin descargas. Base 1rem, interlineado 1.6, ayudas .95rem y títulos fluidos. Espaciado en rem para responder a la ampliación del texto. Nada impide el zoom. Sin alturas fijas de texto; mínimo de controles 44px. Cabecera sin posición fija y mensajes dentro del flujo, evitando ocultar el foco.

## Componentes y lenguaje

- Navegación mediante enlaces nativos con sección activa marcada por texto/fondo/borde y aria-current.
- Botones: Ver detalles, Trasladar equipo, Crear aviso, Editar ubicación, Guardar cambios. Nada se representa solo con un icono.
- Formularios de una columna, etiquetas visibles, ayuda y errores asociados por aria-describedby. Obligatorios salvo indicación de opcional.
- Diálogo nativo, foco al primer campo o a Cancelar en borrado. Al cerrar se restaura el botón de origen, incluso si la tabla lo sustituyó; si ya no existe, se enfoca el contenido principal.
- Confirmaciones que nombran registro y consecuencias, conservadas.
- Tablas semánticas con cabeceras de columna/fila y caption accesible. Región de desplazamiento enfocada con teclado; ayuda visible en pequeño formato.
- Resultados en una región status y errores en alert. Los errores de formulario se presentan dentro del diálogo; no se duplican fuera. El éxito se anuncia después de cerrar el diálogo.

## Adaptación

A 800px se apilan cabecera y título. A 700px la tabla puede desplazarse dentro de su región y el detalle pasa a una columna. A 500px se compacta la cabecera y filtros/acciones principales ocupan el ancho. No se ocultan funciones por tamaño.

El texto al 200% y el viewport 320 × 225 (equivalente de reflujo para 1280 × 900 al 400%) se comprueban técnicamente. La excepción de tabla no se aplica al resto de la página. El zoom nativo del navegador y lectores de pantalla requieren revisión adicional.

## Organización

CSS en base.css (tokens y base), componentes.css (controles/tablas/diálogos) y pantallas.css (composición/adaptación). No hay CSS inline de producción, frameworks, CDN ni animaciones. Se respeta prefers-reduced-motion.

[Boceto previo](BOCETO_REDISENO_2026_10_14.md) · [Resultados y límites](ACCESIBILIDAD_Y_PRUEBAS.md)
