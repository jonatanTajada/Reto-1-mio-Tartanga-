# reto_1_mio

## Propósito

### Inventario del centro
### Recorrido de los equipos
### Avisos de mantenimiento

## Datos

### Usuarios

- Identidad de aplicación
- Hash de contraseña
- ADMIN y USER

### Ubicaciones

- Nombre único
- Almacén obligatorio

### Equipamientos

- Una unidad por fila
- Cinco categorías enum
- Ubicación actual

### Histórico

- Equipo y ubicación
- Inicio y fin
- NULL significa estancia actual
- Máximo un intervalo abierto

### Notificaciones

- Creador USER
- Inicio PENDIENTE
- REALIZADA no se elimina

## Integridad

### Claves primarias y foráneas
### Restricciones CHECK
### Índices y unicidad
### Siete triggers
### Permisos de sesión pendientes en PHP

## Trabajo en Workbench

### 00 — Consultar existencia
### 01 — Crear una vez
### 02 — Datos ficticios
### 03 — Consultas de lectura
### 04 — Pruebas y rollback
### 05 — Rechazos manuales

## Estado

### Diseño preparado
### SQL pendiente de autenticación y ejecución
### Backend pendiente de revisión
