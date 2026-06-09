// =============================================================================
// Proyecto Servicio Social - Creación del grafo en Neo4j Aura
// Resultado de la conversión E-R -> Grafo del modelo relacional (01-insercion-relacional.sql)
//
// Modelo de grafo:
//   (:Alumno)-[:POSTULADO_EN {estado, fecha_inicio}]->(:UnidadReceptora)
//
// Reglas de conversión aplicadas:
//   - Tablas 'alumno' y 'unidad_receptora'      -> Nodos
//   - N:M de catálogos (habilidades/tecnologías)-> propiedades de tipo lista
//   - lat/lng                                   -> propiedad point()
//   - Tabla puente con atributos 'postulacion'  -> relación POSTULADO_EN con propiedades
//
// Ejecutar en Neo4j Aura (Query / cypher-shell). Es idempotente.
// =============================================================================

// -----------------------------------------------------------------------------
// 0. CONSTRAINTS / ÍNDICES
// -----------------------------------------------------------------------------
CREATE CONSTRAINT alumno_correo IF NOT EXISTS
FOR (a:Alumno) REQUIRE a.correo IS UNIQUE;

CREATE CONSTRAINT unidad_id IF NOT EXISTS
FOR (u:UnidadReceptora) REQUIRE u.id_unidad IS UNIQUE;

// -----------------------------------------------------------------------------
// 1. LIMPIEZA (siembra idempotente)
// -----------------------------------------------------------------------------
MATCH (n) WHERE n:Alumno OR n:UnidadReceptora DETACH DELETE n;

// -----------------------------------------------------------------------------
// 2. NODOS :Alumno
//    NOTA: el password debe ser un hash bcrypt. Sustituye '$2a$10$...'
//    por los hashes reales (los mismos que genera /api/seed).
// -----------------------------------------------------------------------------
UNWIND [
  {correo:'admin@uni.edu',   password:'$2a$10$REEMPLAZAR_POR_HASH', nombre:'Administrador', rol:'admin',  habilidades:[],                                              lat:19.4326, lng:-99.1332},
  {correo:'ana@uni.edu',     password:'$2a$10$REEMPLAZAR_POR_HASH', nombre:'Ana López',     rol:'alumno', habilidades:['JavaScript','React','Node.js','SQL','Python'],  lat:19.4326, lng:-99.1332},
  {correo:'carlos@uni.edu',  password:'$2a$10$REEMPLAZAR_POR_HASH', nombre:'Carlos Méndez', rol:'alumno', habilidades:['Python','Machine Learning','SQL','Docker'],     lat:19.4426, lng:-99.1232},
  {correo:'sofia@uni.edu',   password:'$2a$10$REEMPLAZAR_POR_HASH', nombre:'Sofía Ramírez', rol:'alumno', habilidades:['React','JavaScript','Node.js','Docker'],        lat:19.4176, lng:-99.1212},
  {correo:'diego@uni.edu',   password:'$2a$10$REEMPLAZAR_POR_HASH', nombre:'Diego Torres',  rol:'alumno', habilidades:['Python','SQL','Estadística','Excel'],           lat:19.4546, lng:-99.1512},
  {correo:'valeria@uni.edu', password:'$2a$10$REEMPLAZAR_POR_HASH', nombre:'Valeria Núñez', rol:'alumno', habilidades:['Machine Learning','Python','React','SQL'],       lat:19.4606, lng:-99.1072}
] AS row
CREATE (:Alumno {
  correo: row.correo,
  password: row.password,
  nombre: row.nombre,
  rol: row.rol,
  habilidades: row.habilidades,
  ubicacion: point({latitude: row.lat, longitude: row.lng})
});

// -----------------------------------------------------------------------------
// 3. NODOS :UnidadReceptora
// -----------------------------------------------------------------------------
UNWIND [
  {id_unidad:'U1',  nombre_dependencia:'Secretaría de Innovación Digital',       vacantes:5,  tecnologias_requeridas:['JavaScript','React','Node.js'],            lat:19.4526, lng:-99.1182},
  {id_unidad:'U2',  nombre_dependencia:'Instituto de Datos y Estadística',       vacantes:3,  tecnologias_requeridas:['Python','Machine Learning','SQL'],         lat:19.4026, lng:-99.1132},
  {id_unidad:'U3',  nombre_dependencia:'Dirección de Infraestructura TI',        vacantes:4,  tecnologias_requeridas:['Docker','SQL','Python','Node.js'],         lat:19.4826, lng:-99.1732},
  {id_unidad:'U4',  nombre_dependencia:'Coordinación de Salud Pública',          vacantes:6,  tecnologias_requeridas:['Excel','Estadística','Comunicación'],      lat:18.9326, lng:-99.6332},
  {id_unidad:'U5',  nombre_dependencia:'Laboratorio de Inteligencia Artificial', vacantes:2,  tecnologias_requeridas:['Python','Machine Learning','React'],       lat:19.4626, lng:-99.1032},
  {id_unidad:'U6',  nombre_dependencia:'Dirección de Gobierno Digital',          vacantes:12, tecnologias_requeridas:['JavaScript','React','Node.js','SQL'],      lat:19.4506, lng:-99.1552},
  {id_unidad:'U7',  nombre_dependencia:'Centro de Cómputo Universitario',        vacantes:15, tecnologias_requeridas:['Docker','Python','SQL','Node.js'],         lat:19.4086, lng:-99.1492},
  {id_unidad:'U8',  nombre_dependencia:'Observatorio de Datos Abiertos',         vacantes:10, tecnologias_requeridas:['Python','SQL','Estadística','Machine Learning'], lat:19.4446, lng:-99.1052},
  {id_unidad:'U9',  nombre_dependencia:'Unidad de Transformación Tecnológica',   vacantes:8,  tecnologias_requeridas:['React','Node.js','Docker','JavaScript'],   lat:19.4146, lng:-99.1142},
  {id_unidad:'U10', nombre_dependencia:'Instituto de Investigación Aplicada',    vacantes:14, tecnologias_requeridas:['Python','Machine Learning','Estadística'],  lat:19.4666, lng:-99.1452},
  {id_unidad:'U11', nombre_dependencia:'Coordinación de Sistemas Académicos',    vacantes:9,  tecnologias_requeridas:['SQL','JavaScript','React','Node.js'],      lat:19.4216, lng:-99.1622},
  {id_unidad:'U12', nombre_dependencia:'Agencia de Ciberseguridad',              vacantes:11, tecnologias_requeridas:['Python','Docker','SQL'],                   lat:19.4586, lng:-99.1192},
  {id_unidad:'U13', nombre_dependencia:'Secretaría de Movilidad Inteligente',    vacantes:13, tecnologias_requeridas:['JavaScript','React','Python','Machine Learning'], lat:19.4056, lng:-99.1022},
  {id_unidad:'U14', nombre_dependencia:'Hub de Innovación Social',               vacantes:16, tecnologias_requeridas:['React','Node.js','Comunicación','Excel'],  lat:19.4416, lng:-99.1662},
  {id_unidad:'U15', nombre_dependencia:'Plataforma de Servicios Ciudadanos',     vacantes:18, tecnologias_requeridas:['Node.js','SQL','Docker','JavaScript'],     lat:19.4536, lng:-99.1242}
] AS row
CREATE (:UnidadReceptora {
  id_unidad: row.id_unidad,
  nombre_dependencia: row.nombre_dependencia,
  vacantes: row.vacantes,
  tecnologias_requeridas: row.tecnologias_requeridas,
  ubicacion: point({latitude: row.lat, longitude: row.lng})
});

// -----------------------------------------------------------------------------
// 4. RELACIONES :POSTULADO_EN  (migración de la tabla 'postulacion')
//    Esta es la conversión de la tabla puente CON ATRIBUTOS a una arista.
// -----------------------------------------------------------------------------
UNWIND [
  {correo:'ana@uni.edu',     id_unidad:'U1', estado:'aceptada',  fecha_inicio:'2026-04-23'},
  {correo:'ana@uni.edu',     id_unidad:'U6', estado:'pendiente', fecha_inicio:'2026-04-24'},
  {correo:'carlos@uni.edu',  id_unidad:'U2', estado:'aceptada',  fecha_inicio:'2026-04-23'},
  {correo:'sofia@uni.edu',   id_unidad:'U9', estado:'pendiente', fecha_inicio:'2026-04-25'},
  {correo:'valeria@uni.edu', id_unidad:'U5', estado:'rechazada', fecha_inicio:'2026-04-22'}
] AS row
MATCH (a:Alumno {correo: row.correo})
MATCH (u:UnidadReceptora {id_unidad: row.id_unidad})
MERGE (a)-[r:POSTULADO_EN]->(u)
SET r.estado = row.estado,
    r.fecha_inicio = date(row.fecha_inicio);

// -----------------------------------------------------------------------------
// 5. VERIFICACIÓN
// -----------------------------------------------------------------------------
// Conteo de nodos y relaciones:
//   MATCH (a:Alumno) RETURN count(a) AS alumnos;
//   MATCH (u:UnidadReceptora) RETURN count(u) AS unidades;
//   MATCH ()-[r:POSTULADO_EN]->() RETURN count(r) AS postulaciones;
//
// Recomendaciones para un alumno (tecnologías en común + distancia):
//   MATCH (a:Alumno {correo:'ana@uni.edu'})
//   MATCH (u:UnidadReceptora) WHERE u.vacantes > 0
//   WITH a, u,
//        [t IN u.tecnologias_requeridas WHERE t IN a.habilidades] AS comunes,
//        point.distance(a.ubicacion, u.ubicacion)/1000 AS distanciaKm
//   RETURN u.nombre_dependencia, size(comunes) AS compatibilidad,
//          comunes, round(distanciaKm,2) AS distanciaKm
//   ORDER BY compatibilidad DESC, distanciaKm ASC;
