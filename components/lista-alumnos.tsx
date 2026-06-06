"use client"

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from "react"
import { Loader2, Users } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/client"
import type { AlumnoResumen } from "@/lib/types"

export type ListaAlumnosHandle = {
  recargar: () => void
}

export const ListaAlumnos = forwardRef<ListaAlumnosHandle>(function ListaAlumnos(
  _props,
  ref,
) {
  const [alumnos, setAlumnos] = useState<AlumnoResumen[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    try {
      const data = await apiFetch("/api/alumnos")
      setAlumnos(data.alumnos ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar alumnos")
    } finally {
      setLoading(false)
    }
  }, [])

  useImperativeHandle(ref, () => ({ recargar: cargar }), [cargar])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="size-5 text-primary" />
          Alumnos registrados ({alumnos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : alumnos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay alumnos registrados.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {alumnos.map((a) => (
              <li key={a.correo} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{a.nombre}</p>
                  <p className="text-xs text-muted-foreground">{a.correo}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {a.habilidades.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Sin habilidades registradas
                      </span>
                    ) : (
                      a.habilidades.map((h) => (
                        <span
                          key={h}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {h}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {a.postulaciones} postulaciones
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
})
