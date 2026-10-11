# Guía de estilo

La interfaz prioriza lectura de datos y acciones claras. Azul oscuro identifica el espacio de trabajo; verde identifica la acción principal. Los estados tienen texto además de color. Se utilizan variables CSS para aplicar las decisiones de forma homogénea en todas las pantallas.

## Paleta

| Uso | Color | Motivo |
|---|---|---|
| Texto y navegación | `#172c42` | Contraste alto y jerarquía estable |
| Fondo de página | `#f4f6f8` | Distingue tarjetas sin recurrir a bordes fuertes |
| Superficie | `#ffffff` | Formularios y tablas legibles |
| Texto secundario | `#526275` | Ayuda visible sin competir con el título |
| Acción principal | `#0b6b59` | Un mismo color para crear, guardar y acceder |
| Error y eliminación | `#a52332` | Riesgo acompañado siempre por texto explícito |
| Pendiente | `#fff3d9` / texto `#735210` | Estado textual «Pendiente» |
| En proceso | `#e9effb` / texto `#304e89` | Estado textual «En proceso» |
| Realizada | `#e7f5ee` / texto `#17543f` | Estado textual «Realizada» |

El comprobador calcula contraste para ocho pares usados: principal 14.23:1, secundario 6.24:1, botón 6.44:1, navegación 10.54:1, pendiente 6.48:1, en proceso 7.07:1, realizada 7.87:1 y error 6.58:1. Todos superan 4.5:1 en esos pares; esto no certifica cada contexto de la aplicación.

## Tipografía y espacio

Fuentes del sistema: `system-ui`, Segoe UI y alternativas locales. Sin descarga de fuentes. Base 16 px, interlineado 1.55; títulos principales fluidos mediante `clamp`. Texto pequeño en ayudas/cabeceras, con contraste conservado. Espacio basado en múltiplos próximos de 4/8 px; padding general 36 px escritorio, 16–24 px móvil. Bordes de tarjeta 12 px y botones 8 px.

## Componentes

- Botón principal verde, secundario con borde y eliminación con texto rojo. Altura mínima 42 px; controles de entrada 44 px.
- Campos con etiqueta visible, ayuda asociada y error comprensible. `:focus-visible` muestra un contorno de 3 px.
- Tablas con caption, encabezados de columna, líneas de separación y acciones etiquetadas.
- Diálogo nativo para edición/detalle/confirmación. Escape y devolución de foco; cierre bloqueado durante escritura.
- Mensajes de éxito con `role=status` y error con `role=alert`; errores de formulario dentro del diálogo.
- Estado vacío con explicación y estado de carga con `aria-busy`.

## Reutilización y mantenimiento

`base.css` define tokens y estilos comunes, `componentes.css` define componentes y `pantallas.css` composición y media queries. No hay CSS inline. Los formularios se construyen desde definiciones de campos, sin un framework ni una capa de negocio adicional.

Breakpoints: 1000 px ajusta menú y cabeceras; 700 px convierte menú en horizontal y simplifica acceso; 600 px pone formularios a una columna y permite desplazamiento de tablas. Las pruebas cubren anchos 320, 390, 768 y 1440 px, no todos los dispositivos posibles.
