import { NextResponse } from "next/server"
import { runQuery } from "@/lib/neo4j"
import { getSession } from "@/lib/auth"
import type { Alumno } from "@/lib/types"

type Row = {
  correo: string
  nombre: string
  habilidades: string[]
  lat: number
  lng: number
}

// LEER perfil del alumno autenticado.
export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const rows = await runQuery<Row>(
      `MATCH (a:Alumno {correo: $correo})
       RETURN a.correo AS correo, a.nombre AS nombre,
              a.habilidades AS habilidades,
              a.ubicacion.latitude AS lat,
              a.ubicacion.longitude AS lng`,
      { correo: session.correo },
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Alumno no encontrado." }, { status: 404 })
    }

    const perfil: Alumno = rows[0]
    return NextResponse.json({ perfil })
  } catch (error) {
    console.error("[v0] Error al leer perfil:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// ACTUALIZAR las habilidades del alumno.
export async function PUT(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const { habilidades } = await request.json()
    if (!Array.isArray(habilidades)) {
      return NextResponse.json(
        { error: "habilidades debe ser un arreglo." },
        { status: 400 },
      )
    }

    const limpias = habilidades
      .map((h: string) => String(h).trim())
      .filter(Boolean)

    await runQuery(
      `MATCH (a:Alumno {correo: $correo})
       SET a.habilidades = $habilidades`,
      { correo: session.correo, habilidades: limpias },
    )

    return NextResponse.json({ ok: true, habilidades: limpias })
  } catch (error) {
    console.error("[v0] Error al actualizar perfil:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
