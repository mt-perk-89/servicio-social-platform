"use client"

import { Briefcase, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Postulacion } from "@/lib/types"

export default function MisPostulaciones({
  postulaciones,
}: {
  postulaciones: Postulacion[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="size-4" />
          Mis postulaciones
          <Badge variant="secondary" className="ml-auto">
            {postulaciones.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {postulaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no te has postulado a ninguna vacante.
          </p>
        ) : (
          <ul className="space-y-3">
            {postulaciones.map((p) => (
              <li
                key={p.id_unidad}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {p.nombre_dependencia}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {p.fecha_inicio}
                  </p>
                </div>
                <Badge variant="outline">{p.estado}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
