---
markmap:
  colorFreezeLevel: 2
---

# Backend PHP

## Entrada
- public único directorio web
- Rutas y métodos HTTP
- Respuestas JSON
- Errores seguros

## MVC sin Service
- Modelos: validar datos
- DAO: SQL preparado
- Controladores: permisos y transacciones
- Vista: representación JSON

## Seguridad
- Sesión estricta
- CSRF
- password_hash / password_verify
- Releer rol actual
- Revocar por cambio de contraseña

## Módulos
- Usuarios: ADMIN
- Equipamientos
  - Datos: ADMIN
  - Traslado: USER
- Ubicaciones: escritura ADMIN
- Historial: solo lectura PHP
  - Escritura en triggers
- Notificaciones
  - Propias: USER
  - Estado: ADMIN

## Evidencia
- Sintaxis PHP
- Validaciones
- HTTP anónimo
- MySQL y flujos completos pendientes de configuración
- Componente externo RA9 pendiente
- Frontend y Ubuntu posteriores
