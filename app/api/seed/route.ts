import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { runQuery } from "@/lib/neo4j"

// Centro de referencia (CDMX) para generar coordenadas cercanas.
const BASE_LAT = 19.4326
const BASE_LNG = -99.1332

const ALUMNOS = [
  {
    correo: "admin@uni.edu",
    password: "admin123",
    nombre: "Administrador",
    rol: "admin",
    habilidades: [],
    lat: BASE_LAT,
    lng: BASE_LNG,
  },
  {
    correo: "ana@uni.edu",
    password: "123456",
    nombre: "Ana López",
    rol: "alumno",
    habilidades: ["JavaScript", "React", "Node.js", "SQL", "Python"],
    lat: BASE_LAT,
    lng: BASE_LNG,
  },
  {
    correo: "carlos@uni.edu",
    password: "123456",
    nombre: "Carlos Méndez",
    rol: "alumno",
    habilidades: ["Python", "Machine Learning", "SQL", "Docker"],
    lat: BASE_LAT + 0.01,
    lng: BASE_LNG + 0.01,
  },
  {
    correo: "sofia@uni.edu",
    password: "123456",
    nombre: "Sofía Ramírez",
    rol: "alumno",
    habilidades: ["React", "JavaScript", "Node.js", "Docker"],
    lat: BASE_LAT - 0.015,
    lng: BASE_LNG + 0.012,
  },
  {
    correo: "diego@uni.edu",
    password: "123456",
    nombre: "Diego Torres",
    rol: "alumno",
    habilidades: ["Python", "SQL", "Estadística", "Excel"],
    lat: BASE_LAT + 0.022,
    lng: BASE_LNG - 0.018,
  },
  {
    correo: "valeria@uni.edu",
    password: "123456",
    nombre: "Valeria Núñez",
    rol: "alumno",
    habilidades: ["Machine Learning", "Python", "React", "SQL"],
    lat: BASE_LAT + 0.028,
    lng: BASE_LNG + 0.026,
  },
]

const UNIDADES = [
  {
    id_unidad: "U1",
    nombre_dependencia: "Secretaría de Innovación Digital",
    vacantes: 5,
    tecnologias_requeridas: ["JavaScript", "React", "Node.js"],
    lat: BASE_LAT + 0.02,
    lng: BASE_LNG + 0.015,
  },
  {
    id_unidad: "U2",
    nombre_dependencia: "Instituto de Datos y Estadística",
    vacantes: 3,
    tecnologias_requeridas: ["Python", "Machine Learning", "SQL"],
    lat: BASE_LAT - 0.03,
    lng: BASE_LNG + 0.02,
  },
  {
    id_unidad: "U3",
    nombre_dependencia: "Dirección de Infraestructura TI",
    vacantes: 4,
    tecnologias_requeridas: ["Docker", "SQL", "Python", "Node.js"],
    lat: BASE_LAT + 0.05,
    lng: BASE_LNG - 0.04,
  },
  {
    id_unidad: "U4",
    nombre_dependencia: "Coordinación de Salud Pública",
    vacantes: 6,
    tecnologias_requeridas: ["Excel", "Estadística", "Comunicación"],
    lat: BASE_LAT - 0.5,
    lng: BASE_LNG - 0.5,
  },
  {
    id_unidad: "U5",
    nombre_dependencia: "Laboratorio de Inteligencia Artificial",
    vacantes: 2,
    tecnologias_requeridas: ["Python", "Machine Learning", "React"],
    lat: BASE_LAT + 0.03,
    lng: BASE_LNG + 0.03,
  },
  {
    id_unidad: "U6",
    nombre_dependencia: "Dirección de Gobierno Digital",
    vacantes: 12,
    tecnologias_requeridas: ["JavaScript", "React", "Node.js", "SQL"],
    lat: BASE_LAT + 0.018,
    lng: BASE_LNG - 0.022,
  },
  {
    id_unidad: "U7",
    nombre_dependencia: "Centro de Cómputo Universitario",
    vacantes: 15,
    tecnologias_requeridas: ["Docker", "Python", "SQL", "Node.js"],
    lat: BASE_LAT - 0.024,
    lng: BASE_LNG - 0.016,
  },
  {
    id_unidad: "U8",
    nombre_dependencia: "Observatorio de Datos Abiertos",
    vacantes: 10,
    tecnologias_requeridas: ["Python", "SQL", "Estadística", "Machine Learning"],
    lat: BASE_LAT + 0.012,
    lng: BASE_LNG + 0.028,
  },
  {
    id_unidad: "U9",
    nombre_dependencia: "Unidad de Transformación Tecnológica",
    vacantes: 8,
    tecnologias_requeridas: ["React", "Node.js", "Docker", "JavaScript"],
    lat: BASE_LAT - 0.018,
    lng: BASE_LNG + 0.019,
  },
  {
    id_unidad: "U10",
    nombre_dependencia: "Instituto de Investigación Aplicada",
    vacantes: 14,
    tecnologias_requeridas: ["Python", "Machine Learning", "Estadística"],
    lat: BASE_LAT + 0.034,
    lng: BASE_LNG - 0.012,
  },
  {
    id_unidad: "U11",
    nombre_dependencia: "Coordinación de Sistemas Académicos",
    vacantes: 9,
    tecnologias_requeridas: ["SQL", "JavaScript", "React", "Node.js"],
    lat: BASE_LAT - 0.011,
    lng: BASE_LNG - 0.029,
  },
  {
    id_unidad: "U12",
    nombre_dependencia: "Agencia de Ciberseguridad",
    vacantes: 11,
    tecnologias_requeridas: ["Python", "Docker", "SQL"],
    lat: BASE_LAT + 0.026,
    lng: BASE_LNG + 0.014,
  },
  {
    id_unidad: "U13",
    nombre_dependencia: "Secretaría de Movilidad Inteligente",
    vacantes: 13,
    tecnologias_requeridas: ["JavaScript", "React", "Python", "Machine Learning"],
    lat: BASE_LAT - 0.027,
    lng: BASE_LNG + 0.031,
  },
  {
    id_unidad: "U14",
    nombre_dependencia: "Hub de Innovación Social",
    vacantes: 16,
    tecnologias_requeridas: ["React", "Node.js", "Comunicación", "Excel"],
    lat: BASE_LAT + 0.009,
    lng: BASE_LNG - 0.033,
  },
  {
    id_unidad: "U15",
    nombre_dependencia: "Plataforma de Servicios Ciudadanos",
    vacantes: 18,
    tecnologias_requeridas: ["Node.js", "SQL", "Docker", "JavaScript"],
    lat: BASE_LAT + 0.021,
    lng: BASE_LNG + 0.009,
  },
]

export async function POST() {
  try {
    // Limpia datos previos para una siembra idempotente.
    await runQuery("MATCH (n) WHERE n:Alumno OR n:UnidadReceptora DETACH DELETE n")

    for (const a of ALUMNOS) {
      const hash = await bcrypt.hash(a.password, 10)
      await runQuery(
        `CREATE (:Alumno {
          correo: $correo,
          password: $password,
          nombre: $nombre,
          rol: $rol,
          habilidades: $habilidades,
          ubicacion: point({latitude: $lat, longitude: $lng})
        })`,
        { ...a, password: hash },
      )
    }

    for (const u of UNIDADES) {
      await runQuery(
        `CREATE (:UnidadReceptora {
          id_unidad: $id_unidad,
          nombre_dependencia: $nombre_dependencia,
          vacantes: $vacantes,
          tecnologias_requeridas: $tecnologias_requeridas,
          ubicacion: point({latitude: $lat, longitude: $lng})
        })`,
        u,
      )
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Base de datos sembrada correctamente.",
      alumnos: ALUMNOS.map((a) => ({ correo: a.correo, password: a.password, rol: a.rol })),
      unidades: UNIDADES.length,
    })
  } catch (error) {
    console.error("[v0] Error al sembrar:", error)
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
