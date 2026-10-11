# Diccionario de datos

Todos los campos son NOT NULL salvo los señalados. Todos los IDs primarios son AUTO_INCREMENT; no deben editarse. Los textos obligatorios deben tener contenido después de TRIM. Los hashes son cadenas de verificación, nunca contraseñas en claro.

## usuarios

| Campo | Tipo | Clave / valor por defecto | Función |
|---|---|---|---|
| id_usuario | INT UNSIGNED | PK, automático | Identificador de la cuenta |
| nombre | VARCHAR(80) | Obligatorio | Nombre mostrado |
| apellidos | VARCHAR(120) | Obligatorio | Apellidos mostrados |
| nombre_usuario | VARCHAR(60) | UNIQUE | Identificador de login |
| password_hash | VARCHAR(255) | Obligatorio | Hash generado con PHP |
| rol | ENUM('ADMIN','USER') | Sin defecto | Permisos de administrador o conserje |

Un usuario puede tener cero o muchas notificaciones. Su eliminación se bloquea si conserva avisos. La BD no convierte estos roles en privilegios de cuentas SQL.

## ubicaciones

| Campo | Tipo | Clave / valor por defecto | Función |
|---|---|---|---|
| id_ubicacion | INT UNSIGNED | PK, automático | Identificador del espacio |
| nombre | VARCHAR(100) | UNIQUE | Nombre del aula o espacio |
| descripcion | VARCHAR(255) | Obligatorio | Explicación del espacio |

Almacén se inserta durante la creación del esquema. Se protege su nombre y su existencia. Una ubicación referenciada no se elimina; su descripción y, salvo Almacén, su nombre pueden editarse.

## equipamientos

| Campo | Tipo | Clave / valor por defecto | Función |
|---|---|---|---|
| id_equipamiento | INT UNSIGNED | PK, automático | Identifica una unidad |
| nombre | VARCHAR(120) | No único | Nombre de inventario |
| descripcion | VARCHAR(255) | Obligatorio | Detalles del equipo |
| marca | VARCHAR(100) | Obligatorio | Fabricante |
| modelo | VARCHAR(100) | Obligatorio | Modelo |
| categoria | ENUM | Sin defecto | PORTATIL, SOBREMESA, PERIFERICO, AUDIOVISUAL u OTROS |
| id_ubicacion_actual | INT UNSIGNED | FK → ubicaciones | Destino actual; trigger fuerza Almacén al crear |

La ubicación debe proporcionarse técnicamente en INSERT; el DAO usará el ID de Almacén y el trigger lo impondrá. El formulario del administrador no tendrá selector para ella. Los índices de categoría y ubicación apoyan filtros. No se exige nombre único: dos portátiles pueden compartir nombre, marca y modelo y tener IDs distintos.

## historico_ubicaciones

| Campo | Tipo | Clave / valor por defecto | Función |
|---|---|---|---|
| id_historico | BIGINT UNSIGNED | PK, automático | Identificador y desempate cronológico |
| id_equipamiento | INT UNSIGNED | FK → equipamientos | Equipo que estuvo en una ubicación |
| id_ubicacion | INT UNSIGNED | FK → ubicaciones | Lugar de la estancia |
| fecha_inicio | DATETIME(6) | CURRENT_TIMESTAMP(6) | Inicio con microsegundos |
| fecha_fin | DATETIME(6) | NULL, admite NULL | Fin; NULL indica estancia actual |
| abierto | TINYINT generado STORED | 1 o NULL; admite NULL | Soporte técnico de la unicidad; no escribir desde DAO |

UNIQUE(id_equipamiento, abierto) impide dos estancias abiertas. CHECK limita el orden de fechas. Índices: `(id_equipamiento, fecha_inicio, id_historico)` y `(id_ubicacion)`. Un mismo equipo puede volver al mismo lugar varias veces; no se hace único el par equipo–ubicación.

Al borrar equipo se elimina su histórico mediante CASCADE. La ubicación histórica se conserva mientras exista la fila, bloqueando el borrado de la ubicación con RESTRICT.

## notificaciones

| Campo | Tipo | Clave / valor por defecto | Función |
|---|---|---|---|
| id_notificacion | INT UNSIGNED | PK, automático | Identificador del aviso |
| titulo | VARCHAR(150) | Obligatorio | Resumen de incidencia |
| descripcion | TEXT | Obligatorio | Descripción extensa |
| fecha_creacion | DATETIME(6) | CURRENT_TIMESTAMP(6) | Momento de alta |
| estado | ENUM | PENDIENTE | PENDIENTE, EN_PROCESO o REALIZADA |
| id_usuario | INT UNSIGNED | FK → usuarios | Creador, comprobado como USER al insertar |

Índices de estado y usuario. El trigger fuerza PENDIENTE, incluso si el INSERT propone REALIZADA. Un aviso REALIZADO no se borra. No se impone un orden obligatorio de transiciones entre estados que el enunciado no especifica. Las fechas se almacenan sin zona horaria incorporada; el backend debe acordar la zona con MySQL y usarla consistentemente.
