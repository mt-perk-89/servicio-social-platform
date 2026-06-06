import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { runQuery } from "@/lib/neo4j"
import { getSession } from "@/lib/auth"

// Centro de referencia (CDMX) por defecto.
const BASE_LAT = 19.4326
const BASE_LNG = -99.1332

// DAR DE ALTA un alumno (solo admin).
export async function POST(request: Request) {
  const session = await getSession(request)
  if (!session || session.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo el administrador puede dar de alta alumnos." },
      { status: 403 },
    )
  }

  try {
    const body = await request.json()
    const correo = String(body.correo || "").trim().toLowerCase()
    const nombre = String(body.nombre || "").trim()
    const password = String(body.password || "")
    const habilidades = Array.isArray(body.habilidades)
      ? body.habilidades.map((h: string) => String(h).trim()).filter(Boolean)
      : []
    const lat = typeof body.lat === "number" ? body.lat : BASE_LAT
    const lng = typeof body.lng === "number" ? body.lng : BASE_LNG

    if (!correo || !nombre || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 },
      )
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      )
    }

    const existing = await runQuery(
      `MATCH (a:Alumno {correo: $correo}) RETURN a.correo AS correo`,
      { correo },
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 },
      )
    }

    const hash = await bcrypt.hash(password, 10)

    await runQuery(
      `CREATE (:Alumno {
        correo: $correo,
        password: $password,
        nombre: $nombre,
        rol: 'alumno',
        habilidades: $habilidades,
        ubicacion: point({latitude: $lat, longitude: $lng})
      })`,
      { correo, password: hash, nombre, habilidades, lat, lng },
    )

    return NextResponse.json({ ok: true, correo, nombre })
  } catch (error) {
    console.error("[v0] Error al dar de alta alumno:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
