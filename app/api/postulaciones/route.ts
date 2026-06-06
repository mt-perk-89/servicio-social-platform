import { NextResponse } from "next/server"
import { runQuery } from "@/lib/neo4j"
import { getSession } from "@/lib/auth"
import type { Postulacion } from "@/lib/types"

// LEER: lista las postulaciones del alumno autenticado.
export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const rows = await runQuery<Postulacion>(
      `MATCH (a:Alumno {correo: $correo})-[r:POSTULADO_EN]->(u:UnidadReceptora)
       RETURN u.id_unidad AS id_unidad,
              u.nombre_dependencia AS nombre_dependencia,
              r.estado AS estado,
              r.fecha_inicio AS fecha_inicio
       ORDER BY r.fecha_inicio DESC`,
      { correo: session.correo },
    )
    return NextResponse.json({ postulaciones: rows })
  } catch (error) {
    console.error("[v0] Error al leer postulaciones:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// CREAR: postula al alumno en una unidad receptora.
export async function POST(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const { id_unidad } = await request.json()
    if (!id_unidad) {
      return NextResponse.json(
        { error: "id_unidad es obligatorio." },
        { status: 400 },
      )
    }

    await runQuery(
      `MATCH (a:Alumno {correo: $correo}), (u:UnidadReceptora {id_unidad: $id_unidad})
       MERGE (a)-[r:POSTULADO_EN]->(u)
       ON CREATE SET r.estado = 'Pendiente', r.fecha_inicio = toString(date())
       RETURN r`,
      { correo: session.correo, id_unidad },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error al postular:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// ELIMINAR: cancela una postulación existente.
export async function DELETE(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id_unidad = searchParams.get("id_unidad")
    if (!id_unidad) {
      return NextResponse.json(
        { error: "id_unidad es obligatorio." },
        { status: 400 },
      )
    }

    await runQuery(
      `MATCH (a:Alumno {correo: $correo})-[r:POSTULADO_EN]->(u:UnidadReceptora {id_unidad: $id_unidad})
       DELETE r`,
      { correo: session.correo, id_unidad },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error al cancelar:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
