"use client"

import { useState } from "react"
import { Check, Loader2, MapPin, Send, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Recomendacion } from "@/lib/types"
import { apiFetch } from "@/lib/client"
import { toast } from "sonner"

function CompatBar({ value }: { value: number }) {
  const color =
    value >= 60 ? "bg-[oklch(0.55_0.16_150)]" : value >= 30 ? "bg-accent" : "bg-muted-foreground/40"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {value}%
      </span>
    </div>
  )
}

export default function TablaRecomendaciones({
  recomendaciones,
  onRefresh,
}: {
  recomendaciones: Recomendacion[]
  onRefresh: () => void
}) {
  const [pendiente, setPendiente] = useState<string | null>(null)

  async function postular(id_unidad: string) {
    setPendiente(id_unidad)
    try {
      await apiFetch("/api/postulaciones", {
        method: "POST",
        body: JSON.stringify({ id_unidad }),
      })
      toast.success("Postulación enviada.")
      onRefresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setPendiente(null)
    }
  }

  async function cancelar(id_unidad: string) {
    setPendiente(id_unidad)
    try {
      await apiFetch(`/api/postulaciones?id_unidad=${id_unidad}`, {
        method: "DELETE",
      })
      toast.success("Postulación cancelada.")
      onRefresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setPendiente(null)
    }
  }

  if (recomendaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
        <MapPin className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No hay unidades receptoras dentro de 10 km.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Dependencia</TableHead>
            <TableHead className="hidden md:table-cell">Tecnologías</TableHead>
            <TableHead>Compatibilidad</TableHead>
            <TableHead className="hidden sm:table-cell">Distancia</TableHead>
            <TableHead className="hidden sm:table-cell">Vacantes</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recomendaciones.map((r) => {
            const postulado = r.estado !== null
            const cargando = pendiente === r.id_unidad
            return (
              <TableRow key={r.id_unidad}>
                <TableCell className="font-medium text-foreground">
                  {r.depe}
                  {postulado && (
                    <Badge variant="outline" className="ml-2 gap-1 text-xs">
                      <Check className="size-3" />
                      {r.estado}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {r.tecnologias.map((t) => (
                      <span
                        key={t}
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          r.comunes.includes(t)
                            ? "bg-accent/30 font-medium text-accent-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <CompatBar value={r.compatibilidad} />
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {r.distanciaKm} km
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {r.vacantes}
                </TableCell>
                <TableCell className="text-right">
                  {postulado ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelar(r.id_unidad)}
                      disabled={cargando}
                    >
                      {cargando ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <X className="size-4" />
                      )}
                      Cancelar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => postular(r.id_unidad)}
                      disabled={cargando}
                    >
                      {cargando ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      Postularse
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
