import { NextResponse } from "next/server"
import { runQuery } from "@/lib/neo4j"
import { getSession } from "@/lib/auth"
import type { UnidadReceptora } from "@/lib/types"

type Row = {
  id_unidad: string
  nombre_dependencia: string
  vacantes: number
  tecnologias_requeridas: string[]
  lat: number
  lng: number
}

// LISTAR todas las Unidades Receptoras.
export async function GET() {
  try {
    const rows = await runQuery<Row>(
      `MATCH (u:UnidadReceptora)
       RETURN u.id_unidad AS id_unidad,
              u.nombre_dependencia AS nombre_dependencia,
              u.vacantes AS vacantes,
              u.tecnologias_requeridas AS tecnologias_requeridas,
              u.ubicacion.latitude AS lat,
              u.ubicacion.longitude AS lng
       ORDER BY u.id_unidad`,
    )
    const unidades: UnidadReceptora[] = rows
    return NextResponse.json({ unidades })
  } catch (error) {
    console.error("[v0] Error al listar unidades:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DAR DE ALTA una Unidad Receptora (solo admin).
export async function POST(request: Request) {
  const session = await getSession(request)
  if (!session || session.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo el administrador puede dar de alta lugares." },
      { status: 403 },
    )
  }

  try {
    const body = await request.json()
    const id_unidad = String(body.id_unidad || "").trim()
    const nombre_dependencia = String(body.nombre_dependencia || "").trim()
    const vacantes = Number(body.vacantes)
    const tecnologias_requeridas = Array.isArray(body.tecnologias_requeridas)
      ? body.tecnologias_requeridas
          .map((t: string) => String(t).trim())
          .filter(Boolean)
      : []
    const lat = Number(body.lat)
    const lng = Number(body.lng)

    if (!id_unidad || !nombre_dependencia) {
      return NextResponse.json(
        { error: "ID y nombre de la dependencia son obligatorios." },
        { status: 400 },
      )
    }
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: "Latitud y longitud deben ser numéricas." },
        { status: 400 },
      )
    }

    const existing = await runQuery(
      `MATCH (u:UnidadReceptora {id_unidad: $id_unidad}) RETURN u.id_unidad AS id`,
      { id_unidad },
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Ya existe una unidad con ID ${id_unidad}.` },
        { status: 409 },
      )
    }

    await runQuery(
      `CREATE (:UnidadReceptora {
        id_unidad: $id_unidad,
        nombre_dependencia: $nombre_dependencia,
        vacantes: $vacantes,
        tecnologias_requeridas: $tecnologias_requeridas,
        ubicacion: point({latitude: $lat, longitude: $lng})
      })`,
      {
        id_unidad,
        nombre_dependencia,
        vacantes: Number.isNaN(vacantes) ? 0 : vacantes,
        tecnologias_requeridas,
        lat,
        lng,
      },
    )

    return NextResponse.json({ ok: true, id_unidad })
  } catch (error) {
    console.error("[v0] Error al crear unidad:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// ELIMINAR una Unidad Receptora (solo admin).
export async function DELETE(request: Request) {
  const session = await getSession(request)
  if (!session || session.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo el administrador puede eliminar lugares." },
      { status: 403 },
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const id_unidad = searchParams.get("id_unidad")
    if (!id_unidad) {
      return NextResponse.json({ error: "Falta id_unidad." }, { status: 400 })
    }

    await runQuery(
      `MATCH (u:UnidadReceptora {id_unidad: $id_unidad}) DETACH DELETE u`,
      { id_unidad },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error al eliminar unidad:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
