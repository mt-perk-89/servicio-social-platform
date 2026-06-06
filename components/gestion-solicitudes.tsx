"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, ClipboardList, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/client"
import type { SolicitudAdmin } from "@/lib/types"

const ESTADO_STYLES: Record<string, string> = {
  Pendiente: "bg-accent/20 text-accent-foreground",
  Aprobada: "bg-primary/15 text-primary",
  Rechazada: "bg-destructive/15 text-destructive",
}

export function GestionSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/postulaciones")
      setSolicitudes(data.solicitudes ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar solicitudes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function resolver(s: SolicitudAdmin, estado: "Aprobada" | "Rechazada") {
    const key = `${s.correo}|${s.id_unidad}`
    setActualizando(key)
    try {
      await apiFetch("/api/admin/postulaciones", {
        method: "PATCH",
        body: JSON.stringify({
          correo: s.correo,
          id_unidad: s.id_unidad,
          estado,
        }),
      })
      setSolicitudes((prev) =>
        prev.map((p) =>
          p.correo === s.correo && p.id_unidad === s.id_unidad
            ? { ...p, estado }
            : p,
        ),
      )
      toast.success(
        estado === "Aprobada"
          ? `Solicitud de ${s.nombre} aprobada`
          : `Solicitud de ${s.nombre} rechazada`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar")
    } finally {
      setActualizando(null)
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente").length

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="size-5 text-primary" />
          Solicitudes de alumnos
          {pendientes > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              {pendientes} pendientes
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : solicitudes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Todavía no hay postulaciones de alumnos.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {solicitudes.map((s) => {
              const key = `${s.correo}|${s.id_unidad}`
              const busy = actualizando === key
              return (
                <li
                  key={key}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{s.nombre}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          ESTADO_STYLES[s.estado] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.estado}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {s.nombre_dependencia}{" "}
                      <span className="font-mono text-xs">({s.id_unidad})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{s.correo}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => resolver(s, "Aprobada")}
                      disabled={busy || s.estado === "Aprobada"}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => resolver(s, "Rechazada")}
                      disabled={busy || s.estado === "Rechazada"}
                    >
                      <X className="size-4" />
                      Rechazar
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
