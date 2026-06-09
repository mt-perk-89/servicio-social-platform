-- =============================================================================
-- Proyecto Servicio Social - Modelo Relacional (origen de la migración)
-- Motor objetivo: PostgreSQL / MySQL (DDL estándar)
-- Estos son los MISMOS datos que viven en el grafo de Neo4j Aura,
-- expresados en su forma relacional normalizada (3FN) para demostrar
-- la conversión E-R -> Grafo exigida por el proyecto.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ESQUEMA (DDL)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS postulacion;
DROP TABLE IF EXISTS alumno_habilidad;
DROP TABLE IF EXISTS unidad_tecnologia;
DROP TABLE IF EXISTS habilidad;
DROP TABLE IF EXISTS alumno;
DROP TABLE IF EXISTS unidad_receptora;

-- Entidad fuerte: Alumno
CREATE TABLE alumno (
  correo        VARCHAR(120) PRIMARY KEY,
  password      VARCHAR(255) NOT NULL,      -- hash bcrypt
  nombre        VARCHAR(120) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'alumno', -- 'alumno' | 'admin'
  lat           DECIMAL(10,7) NOT NULL,
  lng           DECIMAL(10,7) NOT NULL
);

-- Entidad fuerte: Unidad Receptora
CREATE TABLE unidad_receptora (
  id_unidad           VARCHAR(10) PRIMARY KEY,
  nombre_dependencia  VARCHAR(150) NOT NULL,
  vacantes            INT NOT NULL CHECK (vacantes >= 0),
  lat                 DECIMAL(10,7) NOT NULL,
  lng                 DECIMAL(10,7) NOT NULL
);

-- Catálogo de habilidades/tecnologías (normaliza los arreglos del grafo)
CREATE TABLE habilidad (
  id_habilidad  INT PRIMARY KEY,
  nombre        VARCHAR(60) NOT NULL UNIQUE
);

-- Relación N:M  Alumno -- domina --> Habilidad
CREATE TABLE alumno_habilidad (
  correo        VARCHAR(120) NOT NULL,
  id_habilidad  INT NOT NULL,
  PRIMARY KEY (correo, id_habilidad),
  FOREIGN KEY (correo)       REFERENCES alumno(correo)       ON DELETE CASCADE,
  FOREIGN KEY (id_habilidad) REFERENCES habilidad(id_habilidad)
);

-- Relación N:M  Unidad -- requiere --> Habilidad (tecnología)
CREATE TABLE unidad_tecnologia (
  id_unidad     VARCHAR(10) NOT NULL,
  id_habilidad  INT NOT NULL,
  PRIMARY KEY (id_unidad, id_habilidad),
  FOREIGN KEY (id_unidad)    REFERENCES unidad_receptora(id_unidad) ON DELETE CASCADE,
  FOREIGN KEY (id_habilidad) REFERENCES habilidad(id_habilidad)
);

-- Relación N:M CON ATRIBUTOS  Alumno -- POSTULADO_EN --> Unidad
-- (esta tabla se convierte directamente en la arista del grafo)
CREATE TABLE postulacion (
  correo        VARCHAR(120) NOT NULL,
  id_unidad     VARCHAR(10)  NOT NULL,
  estado        VARCHAR(20)  NOT NULL DEFAULT 'pendiente', -- pendiente|aceptada|rechazada
  fecha_inicio  DATE NOT NULL,
  PRIMARY KEY (correo, id_unidad),
  FOREIGN KEY (correo)    REFERENCES alumno(correo)             ON DELETE CASCADE,
  FOREIGN KEY (id_unidad) REFERENCES unidad_receptora(id_unidad) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 2. DATOS (DML) - extraídos del seed real del sistema en Neo4j
-- -----------------------------------------------------------------------------

-- Catálogo de habilidades
INSERT INTO habilidad (id_habilidad, nombre) VALUES
  (1,  'JavaScript'),
  (2,  'React'),
  (3,  'Node.js'),
  (4,  'SQL'),
  (5,  'Python'),
  (6,  'Machine Learning'),
  (7,  'Docker'),
  (8,  'Estadística'),
  (9,  'Excel'),
  (10, 'Comunicación');

-- Alumnos (password = hash bcrypt; aquí se muestra el texto plano original como comentario)
INSERT INTO alumno (correo, password, nombre, rol, lat, lng) VALUES
  ('admin@uni.edu',   '$2a$10$REEMPLAZAR_POR_HASH', 'Administrador',   'admin',  19.4326000, -99.1332000), -- admin123
  ('ana@uni.edu',     '$2a$10$REEMPLAZAR_POR_HASH', 'Ana López',       'alumno', 19.4326000, -99.1332000), -- 123456
  ('carlos@uni.edu',  '$2a$10$REEMPLAZAR_POR_HASH', 'Carlos Méndez',   'alumno', 19.4426000, -99.1232000), -- 123456
  ('sofia@uni.edu',   '$2a$10$REEMPLAZAR_POR_HASH', 'Sofía Ramírez',   'alumno', 19.4176000, -99.1212000), -- 123456
  ('diego@uni.edu',   '$2a$10$REEMPLAZAR_POR_HASH', 'Diego Torres',    'alumno', 19.4546000, -99.1512000), -- 123456
  ('valeria@uni.edu', '$2a$10$REEMPLAZAR_POR_HASH', 'Valeria Núñez',   'alumno', 19.4606000, -99.1072000); -- 123456

-- Habilidades por alumno (admin no tiene habilidades)
INSERT INTO alumno_habilidad (correo, id_habilidad) VALUES
  ('ana@uni.edu', 1), ('ana@uni.edu', 2), ('ana@uni.edu', 3), ('ana@uni.edu', 4), ('ana@uni.edu', 5),
  ('carlos@uni.edu', 5), ('carlos@uni.edu', 6), ('carlos@uni.edu', 4), ('carlos@uni.edu', 7),
  ('sofia@uni.edu', 2), ('sofia@uni.edu', 1), ('sofia@uni.edu', 3), ('sofia@uni.edu', 7),
  ('diego@uni.edu', 5), ('diego@uni.edu', 4), ('diego@uni.edu', 8), ('diego@uni.edu', 9),
  ('valeria@uni.edu', 6), ('valeria@uni.edu', 5), ('valeria@uni.edu', 2), ('valeria@uni.edu', 4);

-- Unidades receptoras
INSERT INTO unidad_receptora (id_unidad, nombre_dependencia, vacantes, lat, lng) VALUES
  ('U1',  'Secretaría de Innovación Digital',        5,  19.4526000, -99.1182000),
  ('U2',  'Instituto de Datos y Estadística',        3,  19.4026000, -99.1132000),
  ('U3',  'Dirección de Infraestructura TI',         4,  19.4826000, -99.1732000),
  ('U4',  'Coordinación de Salud Pública',           6,  18.9326000, -99.6332000),
  ('U5',  'Laboratorio de Inteligencia Artificial',  2,  19.4626000, -99.1032000),
  ('U6',  'Dirección de Gobierno Digital',           12, 19.4506000, -99.1552000),
  ('U7',  'Centro de Cómputo Universitario',         15, 19.4086000, -99.1492000),
  ('U8',  'Observatorio de Datos Abiertos',          10, 19.4446000, -99.1052000),
  ('U9',  'Unidad de Transformación Tecnológica',    8,  19.4146000, -99.1142000),
  ('U10', 'Instituto de Investigación Aplicada',     14, 19.4666000, -99.1452000),
  ('U11', 'Coordinación de Sistemas Académicos',     9,  19.4216000, -99.1622000),
  ('U12', 'Agencia de Ciberseguridad',               11, 19.4586000, -99.1192000),
  ('U13', 'Secretaría de Movilidad Inteligente',     13, 19.4056000, -99.1022000),
  ('U14', 'Hub de Innovación Social',                16, 19.4416000, -99.1662000),
  ('U15', 'Plataforma de Servicios Ciudadanos',      18, 19.4536000, -99.1242000);

-- Tecnologías requeridas por unidad
INSERT INTO unidad_tecnologia (id_unidad, id_habilidad) VALUES
  ('U1', 1), ('U1', 2), ('U1', 3),
  ('U2', 5), ('U2', 6), ('U2', 4),
  ('U3', 7), ('U3', 4), ('U3', 5), ('U3', 3),
  ('U4', 9), ('U4', 8), ('U4', 10),
  ('U5', 5), ('U5', 6), ('U5', 2),
  ('U6', 1), ('U6', 2), ('U6', 3), ('U6', 4),
  ('U7', 7), ('U7', 5), ('U7', 4), ('U7', 3),
  ('U8', 5), ('U8', 4), ('U8', 8), ('U8', 6),
  ('U9', 2), ('U9', 3), ('U9', 7), ('U9', 1),
  ('U10', 5), ('U10', 6), ('U10', 8),
  ('U11', 4), ('U11', 1), ('U11', 2), ('U11', 3),
  ('U12', 5), ('U12', 7), ('U12', 4),
  ('U13', 1), ('U13', 2), ('U13', 5), ('U13', 6),
  ('U14', 2), ('U14', 3), ('U14', 10), ('U14', 9),
  ('U15', 3), ('U15', 4), ('U15', 7), ('U15', 1);

-- Postulaciones de ejemplo (la parte "nueva" del sistema híbrido nace en el grafo,
-- aquí se incluyen algunas para ilustrar la migración de la relación con atributos)
INSERT INTO postulacion (correo, id_unidad, estado, fecha_inicio) VALUES
  ('ana@uni.edu',     'U1', 'aceptada',  '2026-04-23'),
  ('ana@uni.edu',     'U6', 'pendiente', '2026-04-24'),
  ('carlos@uni.edu',  'U2', 'aceptada',  '2026-04-23'),
  ('sofia@uni.edu',   'U9', 'pendiente', '2026-04-25'),
  ('valeria@uni.edu', 'U5', 'rechazada', '2026-04-22');

-- -----------------------------------------------------------------------------
-- 3. CONSULTA EQUIVALENTE A "RECOMENDACIONES" EN SQL
--    (compatibilidad = #tecnologías en común entre alumno y unidad)
-- -----------------------------------------------------------------------------
-- SELECT u.id_unidad, u.nombre_dependencia, u.vacantes,
--        COUNT(*) AS tecnologias_comunes
-- FROM unidad_receptora u
-- JOIN unidad_tecnologia ut ON ut.id_unidad = u.id_unidad
-- JOIN alumno_habilidad ah  ON ah.id_habilidad = ut.id_habilidad
-- WHERE ah.correo = 'ana@uni.edu' AND u.vacantes > 0
-- GROUP BY u.id_unidad, u.nombre_dependencia, u.vacantes
-- ORDER BY tecnologias_comunes DESC;
