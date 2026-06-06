"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Loader2, Map as MapIcon, Sparkles } from "lucide-react"
import Navbar from "@/components/navbar"
import TablaRecomendaciones from "@/components/tabla-recomendaciones"
import MisPostulaciones from "@/components/mis-postulaciones"
import PerfilHabilidades from "@/components/perfil-habilidades"
import { Card, CardContent } from "@/components/ui/card"
import {
  apiFetch,
  clearSession,
  getAlumno,
  getToken,
  type StoredAlumno,
} from "@/lib/client"
import type { Alumno, Postulacion, Recomendacion } from "@/lib/types"
import { toast } from "sonner"

const MapaUnidades = dynamic(() => import("@/components/mapa-unidades"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function DashboardPage() {
  const router = useRouter()
  const [alumno, setAlumno] = useState<StoredAlumno | null>(null)
  const [perfil, setPerfil] = useState<Alumno | null>(null)
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([])
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)

  const cargarDatos = useCallback(async () => {
    try {
      const [rec, post, perf] = await Promise.all([
        apiFetch("/api/recomendaciones"),
        apiFetch("/api/postulaciones"),
        apiFetch("/api/perfil"),
      ])
      setRecomendaciones(rec.recomendaciones)
      setPostulaciones(post.postulaciones)
      setPerfil(perf.perfil)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getToken()) {
      router.replace("/")
      return
    }
    setAlumno(getAlumno())
    cargarDatos()
  }, [router, cargarDatos])

  function logout() {
    clearSession()
    router.replace("/")
  }

  function onHabilidadesChange() {
    // Recalcular recomendaciones tras cambiar habilidades.
    cargarDatos()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar nombre={alumno?.nombre ?? "Alumno"} onLogout={logout} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Panel del alumno
          </h1>
          <p className="text-sm text-muted-foreground">
            Vacantes de Servicio Social cercanas, ordenadas por compatibilidad.
          </p>
        </div>

        {/* Sección A: Mapa de geolocalización */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <MapIcon className="size-4" />
            Mapa de Unidades Receptoras (radio 10 km)
          </h2>
          <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
              <div className="h-80 w-full sm:h-96">
                {perfil && (
                  <MapaUnidades
                    alumno={{
                      lat: perfil.lat,
                      lng: perfil.lng,
                      nombre: perfil.nombre,
                    }}
                    unidades={recomendaciones}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Sección B: Recomendación inteligente */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="size-4" />
              Recomendación por similitud de cosenos
            </h2>
            <TablaRecomendaciones
              recomendaciones={recomendaciones}
              onRefresh={cargarDatos}
            />
          </section>

          {/* Columna lateral: perfil + postulaciones */}
          <aside className="space-y-6">
            {perfil && (
              <PerfilHabilidades
                habilidades={perfil.habilidades}
                onChange={(nuevas) => {
                  setPerfil({ ...perfil, habilidades: nuevas })
                  onHabilidadesChange()
                }}
              />
            )}
            <MisPostulaciones postulaciones={postulaciones} />
          </aside>
        </div>
      </main>
    </div>
  )
}
