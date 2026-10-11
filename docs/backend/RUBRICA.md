# Correspondencia con la rúbrica DWS

Fuentes locales conservadas: `Documentacion/2DAW_RetoAlumnado_Reto1.pdf`, `Documentacion/Rúbricas/1DAM Rubrica Tecnica DWS.pdf` y planteamiento ODT. No se modifican ni se publican estos originales. Los porcentajes agrupan los apartados de la rúbrica técnica, no son una predicción de nota.

| Apartado | Peso | Implementación | Evidencia y pendiente |
|---|---:|---|---|
| MVC y estructura PHP | 20% | Entrada/rutas, controladores, modelos, DAO y vista JSON separados; sin Service ni framework | Sintaxis comprobada; frontend HTML pendiente |
| Acceso a datos | 30% | PDO nativo, CRUD preparado, filtro, relaciones, errores y transacciones | SQL instalado por el usuario; conexión/CRUD por PHP pendientes de credenciales |
| Autenticación y reglas | 25% | Login/logout, sesión, hashes, autorización por operación, CSRF, traslado separado, historial en triggers | Validaciones y rechazo anónimo comprobados; flujos autenticados y prohibidos entre roles pendientes de ejecución |
| Servicios web y componentes externos (RA7+RA9) | 15% | API HTTP/JSON con métodos y códigos; cliente Python consume el servicio sin dependencias | Servicio sin BD probado; servicio completo pendiente. **No hay componente de terceros integrado y no se considera cubierto RA9** |
| Funcionamiento global e integración | 10% | Módulos y documentación del backend preparados | Aplicación completa, frontend y despliegue pendientes |

## Requisitos aplicados

ADMIN administra usuarios, datos del equipamiento y ubicaciones; consulta inventario e histórico y cambia estados de avisos. USER consulta y filtra inventario, traslada equipamientos y gestiona avisos. Almacén inicial, categorías enumeradas, histórico automático, notificación PENDIENTE inicial y prohibición de borrar REALIZADA. Se siguen las reglas finales del enunciado ante sus contradicciones, registradas en [DUDAS_Y_MEJORAS](../DUDAS_Y_MEJORAS.md).

## Recomendaciones añadidas

Avisos propios para USER, bloqueo de eliminación/degradación de la propia cuenta ADMIN, conservación del último ADMIN, contraseñas de 12–72 bytes, control CSRF, límite de cuerpo, sesiones revocadas por cambio de contraseña y bloqueos transaccionales son decisiones de nuestra implementación. No se atribuyen literalmente al enunciado.

## Componente externo pendiente de concretar

La rúbrica menciona integración funcional de componentes externos, pero la documentación copiada no impone una biblioteca o proveedor concreto. No se ha añadido correo, clima, compras ni módulos adicionales solo para justificar ese apartado. PDO/MySQL y devolver JSON **no se presentan como prueba de RA9 completo**.

Una opción para debatir con la profesora es una biblioteca mantenida para exportar inventario a una hoja de cálculo, cuando se confirme que esa integración aporta valor y entra en el alcance. Esa opción es una recomendación; no existe todavía endpoint de exportación, dependencia instalada ni integración funcional externa. La implementación de los módulos obligatorios del backend no significa que el nivel máximo de todos los criterios esté demostrado.
