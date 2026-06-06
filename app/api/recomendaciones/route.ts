import { NextResponse } from "next/server"
import { runQuery } from "@/lib/neo4j"
import { getSession } from "@/lib/auth"
import type { Recomendacion } from "@/lib/types"

type Row = {
  id_unidad: string
  depe: string
  vac: number
  dist: number
  comp: number
  tecnologias: string[]
  comunes: string[]
  lat: number
  lng: number
  estado: string | null
}

export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    // Similitud de cosenos sobre vectores de habilidades + filtro de radio 10km.
    // point.distance() reemplaza a distance() en Neo4j 5+. Devuelve metros.
    const rows = await runQuery<Row>(
      `MATCH (a:Alumno {correo: $correo}), (u:UnidadReceptora)
       WITH a, u, point.distance(a.ubicacion, u.ubicacion) / 1000 AS distanciaKm
       WHERE distanciaKm <= 10.0
       WITH a, u, distanciaKm,
            [tech IN u.tecnologias_requeridas WHERE tech IN a.habilidades] AS comun
       WITH a, u, distanciaKm, comun,
            size(comun) AS interseccion,
            sqrt(size(a.habilidades) * size(u.tecnologias_requeridas)) AS den
       OPTIONAL MATCH (a)-[r:POSTULADO_EN]->(u)
       WITH u, distanciaKm, comun, r,
            CASE WHEN den > 0 THEN (toFloat(interseccion) / den) ELSE 0.0 END AS sim
       RETURN u.id_unidad AS id_unidad,
              u.nombre_dependencia AS depe,
              u.vacantes AS vac,
              distanciaKm AS dist,
              sim * 100 AS comp,
              u.tecnologias_requeridas AS tecnologias,
              comun AS comunes,
              u.ubicacion.latitude AS lat,
              u.ubicacion.longitude AS lng,
              r.estado AS estado
       ORDER BY comp DESC`,
      { correo: session.correo },
    )

    const recomendaciones: Recomendacion[] = rows.map((r) => ({
      id_unidad: r.id_unidad,
      depe: r.depe,
      vacantes: r.vac,
      distanciaKm: Math.round(r.dist * 100) / 100,
      compatibilidad: Math.round(r.comp * 10) / 10,
      tecnologias: r.tecnologias,
      comunes: r.comunes,
      lat: r.lat,
      lng: r.lng,
      estado: r.estado,
    }))

    return NextResponse.json({ recomendaciones })
  } catch (error) {
    console.error("[v0] Error en recomendaciones:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}
