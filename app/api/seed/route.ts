import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { runQuery } from "@/lib/neo4j"

// Centro de referencia (CDMX) para generar coordenadas cercanas.
const BASE_LAT = 19.4326
const BASE_LNG = -99.1332

const ALUMNOS = [
  {
    correo: "ana@uni.edu",
    password: "123456",
    nombre: "Ana López",
    habilidades: ["JavaScript", "React", "Node.js", "SQL", "Python"],
    lat: BASE_LAT,
    lng: BASE_LNG,
  },
  {
    correo: "carlos@uni.edu",
    password: "123456",
    nombre: "Carlos Méndez",
    habilidades: ["Python", "Machine Learning", "SQL", "Docker"],
    lat: BASE_LAT + 0.01,
    lng: BASE_LNG + 0.01,
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
      alumnos: ALUMNOS.map((a) => ({ correo: a.correo, password: "123456" })),
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
