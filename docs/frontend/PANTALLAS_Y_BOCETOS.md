# Pantallas y bocetos actuales

El [boceto previo del 14/10](BOCETO_REDISENO_2026_10_14.md) se preparó antes de cambiar la interfaz, con justificación y verificaciones previstas. Esta página describe el resultado. Los diagramas son editables como texto.

## Acceso

```text
Material del centro · Tartanga
──────────────────────────────
Entrar a tu cuenta
Usuario      [_______________]
Contraseña   [_______________]
Ayuda y error asociado
[Iniciar sesión]
```

Un solo formulario, sin ilustraciones ni paneles publicitarios. No se muestran las contraseñas de prueba en la pantalla.

## Conserje

```text
Material del centro       Cuenta · Conserje · Cerrar sesión
─────────────────────────────────────────────────────────
Inventario              Ubicaciones                Avisos
─────────────────────────────────────────────────────────
Inventario
Consulta los equipos y su ubicación.
Categoría [Todas]                       [Actualizar lista]
Equipos disponibles
Equipo | Marca/modelo | Categoría | Ubicación | Acciones
...                            [Ver detalles] [Trasladar equipo]
```

Sin estadísticas ni tarjetas de contadores. Ubicaciones es solo consulta. Avisos permite crear/editar los propios y eliminar los no realizados; no cambiar estado. Las comprobaciones PHP permanecen.

## Administrador

Misma cabecera y navegación, añadiendo Usuarios. Inventario permite Crear equipo, Editar equipo y Eliminar equipo; no trasladar. Ubicaciones tiene CRUD, con Almacén protegido. Avisos muestra todos y permite Cambiar estado; no crear/editar contenido/eliminar. No se añaden KPI.

## Detalle, formularios y confirmación

```text
Detalle o acción del registro                       [Cerrar]
Datos generales y, en equipo, historial cronológico
Etiqueta [campo]
Ayuda / error conectado al campo
[Cancelar]                   [Guardar cambios / acción concreta]
```

Un campo debajo de otro. Equipo nuevo sin selector de ubicación; traslado solo pide destino. Aviso USER sin autor ni estado. Contraseña nueva opcional en edición de usuarios. Error de validación enfoca el primer campo que necesita corrección.

El borrado sigue requiriendo Sí, eliminar. El foco inicial en Cancelar evita un borrado accidental. Escape cierra, salvo los segundos de una escritura en curso, limitada por timeout.

## Móvil y ampliación

Cabecera/navegación se ajustan en filas; formularios continúan a una columna. La tabla se desplaza horizontalmente dentro de su región, con instrucciones para teclado. El resto se adapta sin desbordamiento horizontal de página.

## Capturas reales

- [Acceso](evidencias/acceso.png).
- [Administrador en escritorio](evidencias/escritorio.png).
- [Conserje en móvil](evidencias/movil.png).
- [Protanopia](evidencias/conserje-protanopia.png), [deuteranopia](evidencias/conserje-deuteranopia.png) y [tritanopia](evidencias/conserje-tritanopia.png).
- [Reflujo equivalente al 400%](evidencias/reflujo-400-equivalente.png).
- [Texto al 200%](evidencias/texto-200.png).

Las capturas pueden incluir registros ficticios ui_test_ que se eliminan al terminar. No incluyen contraseñas ni credenciales SQL. La revisión visual de una simulación no garantiza accesibilidad.
