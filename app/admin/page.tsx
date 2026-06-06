"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2, MapPin, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/navbar"
import { FormUnidad } from "@/components/form-unidad"
import { apiFetch, clearSession, getAlumno, getToken } from "@/lib/client"
import type { UnidadReceptora } from "@/lib/types"

export default function AdminPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [unidades, setUnidades] = useState<UnidadReceptora[]>([])
  const [loading, setLoading] = useState(true)
  const [eliminando, setEliminando] = useState<string | null>(null)

  const cargarUnidades = useCallback(async () => {
    try {
      const data = await apiFetch("/api/unidades")
      setUnidades(data.unidades ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar unidades")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getToken()) {
      router.replace("/")
      return
    }
    const alumno = getAlumno()
    if (alumno?.rol !== "admin") {
      router.replace("/dashboard")
      return
    }
    setNombre(alumno.nombre)
    cargarUnidades()
  }, [router, cargarUnidades])

  function logout() {
    clearSession()
    router.replace("/")
  }

  async function eliminar(id: string) {
    setEliminando(id)
    try {
      await apiFetch(`/api/unidades?id_unidad=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      toast.success("Unidad eliminada")
      setUnidades((prev) => prev.filter((u) => u.id_unidad !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar nombre={nombre || "Administrador"} onLogout={logout} badge="Admin" />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Da de alta y gestiona las unidades receptoras donde los alumnos
            realizarán su servicio social.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormUnidad onCreada={cargarUnidades} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5 text-primary" />
                Unidades registradas ({unidades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : unidades.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aún no hay unidades registradas. Da de alta la primera con el
                  formulario.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {unidades.map((u) => (
                    <li
                      key={u.id_unidad}
                      className="flex items-start justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono font-semibold text-secondary-foreground">
                            {u.id_unidad}
                          </span>
                          <p className="font-medium text-foreground">
                            {u.nombre_dependencia}
                          </p>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {u.lat.toFixed(4)}, {u.lng.toFixed(4)} · {u.vacantes}{" "}
                          vacantes
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {u.tecnologias_requeridas.map((h) => (
                            <span
                              key={h}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => eliminar(u.id_unidad)}
                        disabled={eliminando === u.id_unidad}
                      >
                        {eliminando === u.id_unidad ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        <span className="hidden sm:inline">Eliminar</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
