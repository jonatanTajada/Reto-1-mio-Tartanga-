# Guía del frontend: estructura y funcionamiento

La aplicación permite utilizar desde el navegador todas las operaciones del backend individual. Utiliza HTML5, tres hojas CSS propias y módulos JavaScript nativos. No incorpora frameworks, bibliotecas de interfaz, CDN, fuentes remotas ni compilación. El `bootstrap.php` existente sigue siendo el cargador PHP, sin relación con Bootstrap CSS.

Rediseño 14/10/2026: cabecera y navegación horizontal, acceso de una columna, listas sin KPI ni resúmenes y botones que explican la acción. Conserje: Inventario, Ubicaciones y Avisos. El Administrador utiliza la misma estructura con Usuarios y sus permisos. Ver [boceto preparado antes de implementar](BOCETO_REDISENO_2026_10_14.md).

## Documentos de lectura

- [Pantallas y bocetos editables](PANTALLAS_Y_BOCETOS.md).
- [Guía de estilo](GUIA_DE_ESTILO.md).
- [Integración, eventos y seguridad](INTEGRACION_Y_EVENTOS.md).
- [Ejecución y recorrido por roles](EJECUCION_Y_RECORRIDO.md).
- [Accesibilidad, pruebas y rúbricas](ACCESIBILIDAD_Y_PRUEBAS.md).

## Estructura

```text
public/
  index.html                   Vista HTML y estructura semántica
  index.php                    Sirve la vista inicial o procesa la API MVC
  router.php                   Adaptación del servidor PHP local
  .htaccess                    Reglas Apache (despliegue pendiente)
  assets/
    css/
      base.css                 Tokens de diseño, tipografía y base
      componentes.css          Formularios, botones, tablas, estados y diálogos
      pantallas.css            Acceso, navegación y adaptación responsive
    js/
      app.js                   Sesión, navegación y carga de módulos
      api.js                   Fetch y token CSRF en memoria
      dom.js                   DOM seguro, nombres de acciones y retorno del foco
      formularios.js           Campos/errores asociados y confirmaciones
      catalogos.js             Etiquetas españolas de los enums
      equipamientos.js         Inventario, detalle, historial y traslado
      ubicaciones.js           Consulta y gestión de ubicaciones
      notificaciones.js        Avisos y cambios de estado
      usuarios.js              Gestión de cuentas
tools/
  probar_frontend.mjs          Chrome real mediante CDP y Node nativo
  teclado_cdp.mjs              Recorridos con Tab/Enter/escritura nativos
  revisar_frontend.py          Revisión estática y contraste
docs/frontend/
  evidencias/                  Capturas reales de acceso, escritorio y móvil
```

La vista está en `public`, los controladores/modelos/DAO PHP siguen en `app` y no se añade Service. JavaScript coordina presentación y eventos; las decisiones de autorización y las reglas de integridad siguen en PHP/MySQL. No guarda contraseñas, usuario o token en localStorage.

## Funciones disponibles

Administrador: inventario y filtro, detalle e histórico, alta/edición/borrado de equipos, CRUD de ubicaciones y usuarios, consulta de avisos y cambio de estado. Conserje: inventario y filtro, detalle/histórico, traslado, consulta de ubicaciones y gestión de avisos propios. Ambos inician y cierran sesión.

Se muestran «Administrador» y «Conserje», conservando internamente ADMIN/USER. Un equipo se crea en Almacén sin selector de ubicación. Un aviso nuevo es pendiente y su autor procede de la sesión. Los avisos realizados no se pueden eliminar; su propietario puede editar el contenido, según la política acordada. Ocultar botones es una ayuda visual, nunca la protección del servidor.

## Estado

Interfaz integrada con la API real y comprobada en Chrome con datos temporales. La [guía de pruebas](ACCESIBILIDAD_Y_PRUEBAS.md) detalla resultados y límites. No se ha hecho despliegue Ubuntu ni pruebas con usuarios reales. Siguen pendientes la integración externa RA9, las dudas de clase y una auditoría completa de accesibilidad.

Verificación del rediseño: 44 comprobaciones con 420 pasos Tab y flujos de ambos roles sin ratón; 12 comprobaciones de perfiles independientes; 44 HTTP específicos de ubicaciones y 118 de regresión. Contraste de diez pares de texto y cuatro de controles. Texto 200% y reflujo equivalente 400%, con zoom nativo y lector real aún pendientes. No se certifica WCAG AA completo.
