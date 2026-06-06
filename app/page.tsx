"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Loader2, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, getToken, saveSession } from "@/lib/client"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [correo, setCorreo] = useState("ana@uni.edu")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (getToken()) router.replace("/dashboard")
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ correo, password }),
      })
      saveSession(data.token, data.alumno)
      toast.success(`Bienvenido, ${data.alumno.nombre}`)
      router.push("/dashboard")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      await apiFetch("/api/seed", { method: "POST" })
      toast.success("Base de datos sembrada. Ya puedes iniciar sesión.")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Panel informativo */}
      <section className="relative flex flex-1 flex-col justify-between bg-primary px-8 py-12 text-primary-foreground lg:px-12">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-7" />
          <span className="text-lg font-semibold tracking-tight">
            Servicio Social
          </span>
        </div>

        <div className="max-w-md space-y-6 py-12">
          <h1 className="text-balance text-3xl font-bold leading-tight lg:text-4xl">
            Encuentra tu Unidad Receptora ideal con datos, no con suerte.
          </h1>
          <p className="text-pretty leading-relaxed text-primary-foreground/80">
            Plataforma de gestión que combina geolocalización y un motor de
            recomendación inteligente para conectarte con las mejores vacantes.
          </p>

          <ul className="space-y-4 pt-4">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 rounded-md bg-primary-foreground/15 p-2">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="font-medium">Geolocalización en 10 km</p>
                <p className="text-sm text-primary-foreground/70">
                  Solo vacantes cercanas a tu ubicación.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 rounded-md bg-primary-foreground/15 p-2">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="font-medium">Similitud de cosenos</p>
                <p className="text-sm text-primary-foreground/70">
                  Compatibilidad por tus habilidades técnicas.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/60">
          Proyecto Hashira · Neo4j Aura · Next.js
        </p>
      </section>

      {/* Formulario */}
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Iniciar sesión
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresa con tu correo institucional.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="alumno@uni.edu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium text-foreground">Primera vez aquí?</p>
            <p className="mt-1 text-muted-foreground">
              Siembra datos de prueba en Neo4j para empezar. Usuarios:{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-xs">
                ana@uni.edu
              </code>{" "}
              /{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-xs">
                carlos@uni.edu
              </code>{" "}
              · clave{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-xs">
                123456
              </code>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding && <Loader2 className="size-4 animate-spin" />}
              Sembrar base de datos
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
