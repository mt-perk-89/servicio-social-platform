# Proyecto Neo4j — Plataforma de Servicio Social

Documento de entrega de los requerimientos del proyecto de bases de datos orientadas a grafos.
Describe (1) la problemática resuelta con un grafo, (2) el **modelo relacional en SQL** equivalente y
(3) el procedimiento de **importación / migración del modelo E-R a Neo4j** (sistema híbrido: datos
migrados desde SQL + datos nuevos creados directamente en el grafo).

> El sistema ya está implementado en Neo4j (este repositorio). Este documento existe como entregable
> académico: muestra cómo se vería el origen relacional y cómo se realizaría la conversión a grafo.

---

## 1. Problemática

La asignación de **servicio social universitario** implica relacionar continuamente tres cosas:

- **Alumnos** con un conjunto de **habilidades** y una **ubicación** geográfica.
- **Unidades receptoras** (dependencias) con **tecnologías requeridas**, **vacantes** y ubicación.
- **Postulaciones** entre alumnos y unidades, cada una con un **estado** y una **fecha**.

El valor del sistema está en las **relaciones** y en recorrerlas para generar **recomendaciones**:
"¿qué unidades son más compatibles con las habilidades de este alumno y están cerca de él?".
En un modelo relacional esto exige múltiples `JOIN` y tablas puente; en un grafo la consulta es un
recorrido natural de aristas. Por eso se eligió una base **orientada a grafos (Neo4j)**:

- Las **coincidencias de habilidades** se calculan como intersección de listas (similitud de coseno).
- La **cercanía geográfica** se resuelve con tipos `point` y `point.distance()`.
- Las **postulaciones** son aristas con propiedades (`estado`, `fecha_inicio`), no filas en una tabla puente.

### Modelo de grafo actual (destino)

```
(:Alumno {correo, password, nombre, rol, habilidades[], ubicacion:point})
        -[:POSTULADO_EN {estado, fecha_inicio}]->
(:UnidadReceptora {id_unidad, nombre_dependencia, vacantes, tecnologias_requeridas[], ubicacion:point})
```

---

## 2. Modelo relacional en SQL (origen de la migración)

El modelo relacional **normaliza** lo que en el grafo son arreglos (`habilidades`,
`tecnologias_requeridas`) y propiedades de relación. Diseño en **3FN**:

### 2.1 Diagrama E-R (resumen)

```
ALUMNO (correo PK) ───< ALUMNO_HABILIDAD >─── HABILIDAD (id PK)
   │                                              │
   │                                              │
   └───< POSTULACION >─── UNIDAD_RECEPTORA (id_unidad PK) ───< UNIDAD_TECNOLOGIA >── HABILIDAD
```

- `ALUMNO` 1—N `POSTULACION` N—1 `UNIDAD_RECEPTORA` (tabla puente con atributos).
- `ALUMNO` N—M `HABILIDAD` vía `ALUMNO_HABILIDAD`.
- `UNIDAD_RECEPTORA` N—M `HABILIDAD` (tecnologías) vía `UNIDAD_TECNOLOGIA`.
- Las coordenadas se guardan como dos columnas `lat` / `lng` (en el grafo se fusionan en un `point`).

### 2.2 DDL (PostgreSQL / MySQL compatible)

```sql
-- Catálogo único de habilidades / tecnologías (reutilizado por alumnos y unidades)
CREATE TABLE habilidad (
    id_habilidad   SERIAL PRIMARY KEY,
    nombre         VARCHAR(80) NOT NULL UNIQUE
);

-- Alumnos del sistema
CREATE TABLE alumno (
    correo         VARCHAR(120) PRIMARY KEY,
    password_hash  VARCHAR(255) NOT NULL,
    nombre         VARCHAR(150) NOT NULL,
    rol            VARCHAR(20)  NOT NULL DEFAULT 'alumno'
                   CHECK (rol IN ('alumno', 'admin')),
    lat            DOUBLE PRECISION NOT NULL,
    lng            DOUBLE PRECISION NOT NULL
);

-- Unidades receptoras (dependencias)
CREATE TABLE unidad_receptora (
    id_unidad          VARCHAR(10) PRIMARY KEY,
    nombre_dependencia VARCHAR(200) NOT NULL,
    vacantes           INT NOT NULL DEFAULT 0,
    lat                DOUBLE PRECISION NOT NULL,
    lng                DOUBLE PRECISION NOT NULL
);

-- N—M: habilidades de cada alumno
CREATE TABLE alumno_habilidad (
    correo        VARCHAR(120) NOT NULL REFERENCES alumno(correo) ON DELETE CASCADE,
    id_habilidad  INT NOT NULL REFERENCES habilidad(id_habilidad) ON DELETE CASCADE,
    PRIMARY KEY (correo, id_habilidad)
);

-- N—M: tecnologías requeridas por cada unidad
CREATE TABLE unidad_tecnologia (
    id_unidad     VARCHAR(10) NOT NULL REFERENCES unidad_receptora(id_unidad) ON DELETE CASCADE,
    id_habilidad  INT NOT NULL REFERENCES habilidad(id_habilidad) ON DELETE CASCADE,
    PRIMARY KEY (id_unidad, id_habilidad)
);

-- Tabla puente con atributos -> se convierte en la relación POSTULADO_EN
CREATE TABLE postulacion (
    correo        VARCHAR(120) NOT NULL REFERENCES alumno(correo) ON DELETE CASCADE,
    id_unidad     VARCHAR(10)  NOT NULL REFERENCES unidad_receptora(id_unidad) ON DELETE CASCADE,
    estado        VARCHAR(20)  NOT NULL DEFAULT 'Pendiente'
                  CHECK (estado IN ('Pendiente', 'Aceptada', 'Rechazada')),
    fecha_inicio  DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (correo, id_unidad)
);
```

### 2.3 Datos de ejemplo (extracto)

```sql
INSERT INTO habilidad (nombre) VALUES
  ('JavaScript'),('React'),('Node.js'),('SQL'),('Python'),
  ('Machine Learning'),('Docker'),('Estadística'),('Excel'),('Comunicación');

INSERT INTO alumno (correo, password_hash, nombre, rol, lat, lng) VALUES
  ('admin@uni.edu', '$2a$10$...', 'Administrador', 'admin', 19.4326, -99.1332),
  ('ana@uni.edu',   '$2a$10$...', 'Ana López',     'alumno', 19.4326, -99.1332),
  ('carlos@uni.edu','$2a$10$...', 'Carlos Méndez', 'alumno', 19.4426, -99.1232);

INSERT INTO unidad_receptora (id_unidad, nombre_dependencia, vacantes, lat, lng) VALUES
  ('U1', 'Secretaría de Innovación Digital', 5, 19.4526, -99.1182),
  ('U2', 'Instituto de Datos y Estadística', 3, 19.4026, -99.1132);

-- Habilidades de Ana
INSERT INTO alumno_habilidad (correo, id_habilidad)
SELECT 'ana@uni.edu', id_habilidad FROM habilidad
WHERE nombre IN ('JavaScript','React','Node.js','SQL','Python');

-- Tecnologías de U1
INSERT INTO unidad_tecnologia (id_unidad, id_habilidad)
SELECT 'U1', id_habilidad FROM habilidad
WHERE nombre IN ('JavaScript','React','Node.js');

-- Una postulación
INSERT INTO postulacion (correo, id_unidad, estado, fecha_inicio)
VALUES ('ana@uni.edu', 'U1', 'Pendiente', CURRENT_DATE);
```

### 2.4 Consulta equivalente de "recomendaciones" en SQL

Para mostrar el contraste con el grafo, así se vería la compatibilidad por habilidades en SQL puro
(sin el cálculo geográfico, que en relacional requeriría PostGIS):

```sql
SELECT u.id_unidad,
       u.nombre_dependencia,
       COUNT(ut.id_habilidad) AS habilidades_comunes
FROM   unidad_receptora u
JOIN   unidad_tecnologia ut ON ut.id_unidad = u.id_unidad
JOIN   alumno_habilidad  ah ON ah.id_habilidad = ut.id_habilidad
WHERE  ah.correo = 'ana@uni.edu'
GROUP  BY u.id_unidad, u.nombre_dependencia
ORDER  BY habilidades_comunes DESC;
```

---

## 3. Conversión del modelo E-R a grafo

### 3.1 Reglas de mapeo aplicadas

| Elemento relacional | Elemento en Neo4j |
| --- | --- |
| Tabla fuerte `alumno` | Nodo `(:Alumno)` |
| Tabla fuerte `unidad_receptora` | Nodo `(:UnidadReceptora)` |
| Tabla puente con atributos `postulacion` | Relación `-[:POSTULADO_EN {estado, fecha_inicio}]->` |
| Tabla puente N—M `alumno_habilidad` | Propiedad de lista `habilidades[]` en `Alumno` |
| Tabla puente N—M `unidad_tecnologia` | Propiedad de lista `tecnologias_requeridas[]` en `UnidadReceptora` |
| Columnas `lat` + `lng` | Propiedad espacial `ubicacion: point({latitude, longitude})` |
| Clave primaria `correo` / `id_unidad` | Propiedad clave + constraint `UNIQUE` |

> Decisión de diseño: las N—M con catálogos *sin atributos propios* (habilidades) se **desnormalizan**
> a listas dentro del nodo, porque las consultas siempre las usan como atributo del alumno/unidad y
> nunca como entidad independiente. La N—M *con atributos* (postulación) sí se vuelve una **arista**.

### 3.2 Restricciones e índices en Neo4j

```cypher
CREATE CONSTRAINT alumno_correo IF NOT EXISTS
FOR (a:Alumno) REQUIRE a.correo IS UNIQUE;

CREATE CONSTRAINT unidad_id IF NOT EXISTS
FOR (u:UnidadReceptora) REQUIRE u.id_unidad IS UNIQUE;
```

### 3.3 Importación con `LOAD CSV` (datos migrados)

Se exportan las tablas SQL a CSV (`COPY ... TO` en Postgres o `SELECT ... INTO OUTFILE` en MySQL)
y se colocan en la carpeta `import/` de Neo4j. Luego:

```cypher
// --- Nodos Alumno (incluye agregación de habilidades) ---
LOAD CSV WITH HEADERS FROM 'file:///alumnos.csv' AS row
MERGE (a:Alumno {correo: row.correo})
SET a.nombre    = row.nombre,
    a.password  = row.password_hash,
    a.rol       = row.rol,
    a.ubicacion = point({latitude: toFloat(row.lat), longitude: toFloat(row.lng)});

// alumno_habilidad.csv -> columnas: correo, habilidad
LOAD CSV WITH HEADERS FROM 'file:///alumno_habilidad.csv' AS row
MATCH (a:Alumno {correo: row.correo})
SET a.habilidades = coalesce(a.habilidades, []) + row.habilidad;

// --- Nodos UnidadReceptora ---
LOAD CSV WITH HEADERS FROM 'file:///unidades.csv' AS row
MERGE (u:UnidadReceptora {id_unidad: row.id_unidad})
SET u.nombre_dependencia = row.nombre_dependencia,
    u.vacantes           = toInteger(row.vacantes),
    u.ubicacion          = point({latitude: toFloat(row.lat), longitude: toFloat(row.lng)});

// unidad_tecnologia.csv -> columnas: id_unidad, tecnologia
LOAD CSV WITH HEADERS FROM 'file:///unidad_tecnologia.csv' AS row
MATCH (u:UnidadReceptora {id_unidad: row.id_unidad})
SET u.tecnologias_requeridas = coalesce(u.tecnologias_requeridas, []) + row.tecnologia;

// --- Relaciones POSTULADO_EN (tabla puente con atributos) ---
LOAD CSV WITH HEADERS FROM 'file:///postulaciones.csv' AS row
MATCH (a:Alumno {correo: row.correo})
MATCH (u:UnidadReceptora {id_unidad: row.id_unidad})
MERGE (a)-[r:POSTULADO_EN]->(u)
SET r.estado = row.estado,
    r.fecha_inicio = row.fecha_inicio;
```

### 3.4 Alternativa: ETL relacional directo con APOC

Si se prefiere leer directo de la base relacional (sin pasar por CSV), se usa `apoc.load.jdbc`:

```cypher
CALL apoc.load.jdbc(
  'jdbc:postgresql://host:5432/servicio_social?user=...&password=...',
  'SELECT correo, password_hash, nombre, rol, lat, lng FROM alumno'
) YIELD row
MERGE (a:Alumno {correo: row.correo})
SET a.nombre = row.nombre,
    a.password = row.password_hash,
    a.rol = row.rol,
    a.ubicacion = point({latitude: row.lat, longitude: row.lng});
```

### 3.5 Parte "nueva" del sistema híbrido (datos no migrados)

No todo proviene de SQL. Estos datos **nacen directamente en el grafo** durante el uso normal de la
aplicación, demostrando el carácter híbrido del proyecto:

- **Nuevas postulaciones** creadas por los alumnos desde la app (ya implementado):

  ```cypher
  MATCH (a:Alumno {correo: $correo}), (u:UnidadReceptora {id_unidad: $id_unidad})
  MERGE (a)-[r:POSTULADO_EN]->(u)
  ON CREATE SET r.estado = 'Pendiente', r.fecha_inicio = toString(date());
  ```

- **Registro de nuevos alumnos** y edición de habilidades directamente como nodos/propiedades del grafo.
- **Cambios de estado** de postulación (`Aceptada` / `Rechazada`) gestionados por el administrador.

### 3.6 Verificación post-migración

```cypher
// Conteos de control contra el origen SQL
MATCH (a:Alumno)            RETURN count(a) AS alumnos;
MATCH (u:UnidadReceptora)   RETURN count(u) AS unidades;
MATCH (:Alumno)-[r:POSTULADO_EN]->() RETURN count(r) AS postulaciones;

// Muestra de integridad de un alumno migrado
MATCH (a:Alumno {correo: 'ana@uni.edu'})
RETURN a.nombre, a.habilidades, a.ubicacion;
```

---

## 4. Resumen de equivalencias

| Concepto | SQL (origen) | Neo4j (destino) |
| --- | --- | --- |
| Alumno | fila en `alumno` | nodo `:Alumno` |
| Unidad | fila en `unidad_receptora` | nodo `:UnidadReceptora` |
| Habilidad del alumno | fila en `alumno_habilidad` | elemento de `habilidades[]` |
| Tecnología de unidad | fila en `unidad_tecnologia` | elemento de `tecnologias_requeridas[]` |
| Postulación | fila en `postulacion` | relación `:POSTULADO_EN` |
| Ubicación | `lat`, `lng` | `point()` |
| Recomendación | `JOIN` + `GROUP BY` (+ PostGIS) | recorrido + `point.distance()` |

Este mapeo garantiza que el grafo ya construido en el repositorio sea **funcionalmente equivalente**
al modelo relacional propuesto, cumpliendo los dos entregables del proyecto: la propuesta de
problemática (entrega 23/04/2026) y la conversión/importación del modelo E-R a grafos (entrega 30/04/2026).
