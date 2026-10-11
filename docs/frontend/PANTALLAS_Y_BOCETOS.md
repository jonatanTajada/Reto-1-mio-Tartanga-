# Pantallas y bocetos editables

Estos bocetos describen la estructura que guía la interfaz entregada y pueden modificarse como texto. Las capturas enlazadas son evidencias del navegador, no sustituyen los bocetos ni representan una prueba humana de usabilidad.

## Acceso

```text
┌─────────────────────────────┬─────────────────────────────┐
│ Marca y propósito           │ Bienvenido / Inicia sesión  │
│                             │ Usuario [________________]  │
│ Inventario del centro       │ Contraseña [_____________]  │
│ Ilustración de equipamiento │ Ayuda del rol               │
│                             │ [Iniciar sesión]            │
│ Proyecto DAW                │ Error / Reintentar          │
└─────────────────────────────┴─────────────────────────────┘
```

En móvil se conserva una cabecera compacta y el formulario ocupa el ancho disponible. No se muestran contraseñas de demostración en la pantalla.

## Espacio de trabajo

```text
┌─────────────────┬──────────────────────────────────────────┐
│ Marca           │ Cuenta · Rol · Cerrar sesión             │
│                 ├──────────────────────────────────────────┤
│ Inventario      │ Título y descripción     [Nuevo registro]│
│ Ubicaciones     │ Resumen (solo en inventario)              │
│ Notificaciones  │ Equipos | Ubicaciones | Avisos visibles   │
│ Usuarios ADMIN  │ Listado · Categoría · Actualizar          │
│                 │ Tabla con datos y acciones por rol        │
│ Ayuda del rol   │ Estado de carga, vacío o error            │
└─────────────────┴──────────────────────────────────────────┘
```

La navegación utiliza botones con `aria-current="page"` y fragmentos URL como `#equipamientos`. Atrás/adelante del navegador cambia de sección. El enlace de salto mueve el foco sin modificar el fragmento de navegación.

## Detalle e historial

```text
┌────────── Detalle del equipamiento ────────── [Cerrar] ────┐
│ Nombre, descripción, marca, modelo, categoría y ubicación │
│ Historial cronológico:                                   │
│  • Almacén: inicio → fin                                 │
│  • Aula: inicio → actualidad [Ubicación actual]            │
│ [Trasladar equipamiento] solo Conserje                    │
└──────────────────────────────────────────────────────────┘
```

Los tiempos se muestran tal como están registrados en MySQL; no se inventa otra zona horaria. El histórico es de consulta.

## Formularios, traslado y confirmaciones

```text
┌────────── Nueva / Editar entidad ──────────── [Cerrar] ────┐
│ Explicación breve de la regla                             │
│ Etiqueta [campo]               Etiqueta [campo]            │
│ Descripción [texto de varias líneas]                      │
│ Ayuda / error específico                                  │
│                              [Cancelar] [Guardar cambios]│
└──────────────────────────────────────────────────────────┘
```

Equipamiento ADMIN no incluye ubicación. Traslado USER solo incluye destino. Aviso USER no incluye estado/autor. Cambio de estado ADMIN solo incluye el enum. Usuario incluye contraseña nueva opcional en edición. Almacén tiene nombre de solo lectura y no ofrece borrado.

Las eliminaciones abren otro diálogo con el nombre del registro, sus consecuencias y dos acciones: Cancelar / Sí, eliminar. El foco inicial está en Cancelar. Durante la escritura se desactiva la repetición y el cierre para evitar ambigüedad.

## Adaptación móvil

```text
┌───────────────────────────┐
│ Marca                     │
│ Inventario Ubicaciones    │
│ Avisos [Usuarios ADMIN]   │
├───────────────────────────┤
│ Cuenta · Rol · Salir      │
│ Título / acción de alta   │
│ Resumen                  │
│ Filtro / actualizar      │
│ Tabla con desplazamiento │
└───────────────────────────┘
```

Se mantiene la tabla semántica, con desplazamiento horizontal dentro de su región enfocable. Los formularios pasan a una columna. Esta decisión conserva la comparación entre registros sin desbordar toda la página.

## Capturas de navegador

- [Acceso](evidencias/acceso.png).
- [Inventario de escritorio, 1440 × 1000](evidencias/escritorio.png).
- [Inventario móvil, 390 × 844](evidencias/movil.png).

La captura móvil puede incluir cuentas y registros ficticios temporales de la prueba, que después se eliminaron. No contiene credenciales SQL ni contraseñas.
