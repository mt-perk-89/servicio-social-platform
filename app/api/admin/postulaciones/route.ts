import { NextResponse } from "next/server"
import { runQuery } from "@/lib/neo4j"
import { getSession } from "@/lib/auth"

type SolicitudAdmin = {
  correo: string
  nombre: string
  id_unidad: string
  nombre_dependencia: string
  estado: string
  fecha_inicio: string
}

const ESTADOS_VALIDOS = ["Aprobada", "Rechazada", "Pendiente"]

// LEER: lista todas las postulaciones de todos los alumnos (solo admin).
export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session || session.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo el administrador puede ver las solicitudes." },
      { status: 403 },
    )
  }

  try {
    const rows = await runQuery<SolicitudAdmin>(
      `MATCH (a:Alumno)-[r:POSTULADO_EN]->(u:UnidadReceptora)
       RETURN a.correo AS correo, a.nombre AS nombre,
              u.id_unidad AS id_unidad,
              u.nombre_dependencia AS nombre_dependencia,
              r.estado AS estado,
              r.fecha_inicio AS fecha_inicio
       ORDER BY
         CASE r.estado WHEN 'Pendiente' THEN 0 WHEN 'Aprobada' THEN 1 ELSE 2 END,
         r.fecha_inicio DESC`,
    )
    return NextResponse.json({ solicitudes: rows })
  } catch (error) {
    console.error("[v0] Error al listar solicitudes:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// ACTUALIZAR: aprueba o rechaza una postulación (solo admin).
export async function PATCH(request: Request) {
  const session = await getSession(request)
  if (!session || session.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo el administrador puede gestionar solicitudes." },
      { status: 403 },
    )
  }

  try {
    const { correo, id_unidad, estado } = await request.json()
    if (!correo || !id_unidad || !estado) {
      return NextResponse.json(
        { error: "correo, id_unidad y estado son obligatorios." },
        { status: 400 },
      )
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json(
        { error: "Estado no válido." },
        { status: 400 },
      )
    }

    const rows = await runQuery(
      `MATCH (a:Alumno {correo: $correo})-[r:POSTULADO_EN]->(u:UnidadReceptora {id_unidad: $id_unidad})
       SET r.estado = $estado
       RETURN r.estado AS estado`,
      { correo, id_unidad, estado },
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró la postulación." },
        { status: 404 },
      )
    }

    return NextResponse.json({ ok: true, estado })
  } catch (error) {
    console.error("[v0] Error al actualizar solicitud:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
