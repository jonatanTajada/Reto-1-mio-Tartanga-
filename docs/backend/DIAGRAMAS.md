# Diagramas editables

Fuentes Mermaid: se pueden editar como texto y abrir en un visor compatible. No son imágenes cerradas ni requieren modificar el material oficial.

```mermaid
flowchart LR
    Cliente[Cliente HTTP / futuro frontend] --> Entrada[public/index.php: ruta y método]
    Entrada --> Seguridad[Sesión y CSRF]
    Seguridad --> Controlador[Controlador: permiso y coordinación]
    Controlador --> Modelo[Modelo: valida campos]
    Controlador --> DAO[DAO: consultas preparadas]
    DAO --> PDO[Conexión PDO]
    PDO --> BD[(reto_1_mio)]
    BD --> Triggers[Triggers de reglas e historial]
    DAO --> Controlador
    Controlador --> Vista[Respuesta JSON]
    Vista --> Cliente
```

```mermaid
sequenceDiagram
    participant U as USER autenticado
    participant E as Entrada y sesión
    participant C as EquipamientoController
    participant D as EquipamientoDAO
    participant B as MySQL y triggers
    U->>E: PATCH /equipamientos/id/ubicacion + CSRF
    E->>C: Ruta y cuerpo
    C->>B: Verificar usuario actual
    C->>C: Exigir USER y validar destino
    C->>B: BEGIN y bloqueo del equipo
    C->>D: trasladar(id, destino)
    D->>B: UPDATE ubicación actual
    B->>B: Cerrar intervalo y abrir nuevo
    C->>B: COMMIT
    C-->>U: 200 JSON
```

La comprobación de identidad consulta la BD mediante `UsuarioDAO`. El diagrama la abrevia para mostrar el flujo principal. No existe una capa Service entre controlador y DAO.
