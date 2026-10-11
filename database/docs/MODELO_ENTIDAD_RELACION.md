# Modelo entidad-relación editable

Fuente Mermaid: se puede editar el bloque de texto y visualizarlo con un visor Mermaid compatible. No se necesita enviar datos reales a servicios externos.

```mermaid
erDiagram
    usuarios ||--o{ notificaciones : crea
    ubicaciones ||--o{ equipamientos : contiene_actualmente
    equipamientos ||--|{ historico_ubicaciones : registra
    ubicaciones ||--o{ historico_ubicaciones : aparece_en
    usuarios {
        int id_usuario PK
        varchar nombre
        varchar apellidos
        varchar nombre_usuario UK
        varchar password_hash
        enum rol
    }
    ubicaciones {
        int id_ubicacion PK
        varchar nombre UK
        varchar descripcion
    }
    equipamientos {
        int id_equipamiento PK
        varchar nombre
        varchar descripcion
        varchar marca
        varchar modelo
        enum categoria
        int id_ubicacion_actual FK
    }
    historico_ubicaciones {
        bigint id_historico PK
        int id_equipamiento FK
        int id_ubicacion FK
        datetime fecha_inicio
        datetime fecha_fin
        tinyint abierto "Generado: 1 o NULL"
    }
    notificaciones {
        int id_notificacion PK
        varchar titulo
        text descripcion
        datetime fecha_creacion
        enum estado
        int id_usuario FK
    }
```

La relación de uno o más intervalos por equipo expresa el flujo de alta y traslado controlado por triggers. UNIQUE garantiza como máximo un intervalo abierto; no todas las cardinalidades de negocio se expresan únicamente mediante FK. `fecha_fin` y `abierto` admiten NULL. La clave única del histórico es compuesta por equipo y abierto.

Consulta el [diccionario con tipos exactos](DICCIONARIO_DE_DATOS.md).
