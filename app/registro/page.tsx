"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GraduationCap, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { apiFetch, saveSession } from "@/lib/client"
import { toast } from "sonner"

export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [habilidades, setHabilidades] = useState<string[]>([])
  const [nuevaHabilidad, setNuevaHabilidad] = useState("")
  const [loading, setLoading] = useState(false)

  function agregarHabilidad() {
    const valor = nuevaHabilidad.trim()
    if (!valor) return
    if (habilidades.some((h) => h.toLowerCase() === valor.toLowerCase())) {
      setNuevaHabilidad("")
      return
    }
    setHabilidades((prev) => [...prev, valor])
    setNuevaHabilidad("")
  }

  function quitarHabilidad(h: string) {
    setHabilidades((prev) => prev.filter((x) => x !== h))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch("/api/registro", {
        method: "POST",
        body: JSON.stringify({ nombre, correo, password, habilidades }),
      })
      saveSession(data.token, data.alumno)
      toast.success(`Cuenta creada. Bienvenido, ${data.alumno.nombre}`)
      router.push("/dashboard")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio de sesión
        </Link>

        <div className="space-y-2">
          <span className="inline-flex rounded-md bg-primary p-2 text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Crear cuenta de alumno
          </h1>
          <p className="text-sm text-muted-foreground">
            Regístrate para descubrir vacantes de Servicio Social compatibles
            con tus habilidades.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ana López"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correo">Correo institucional</Label>
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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habilidad">Habilidades técnicas</Label>
            <div className="flex gap-2">
              <Input
                id="habilidad"
                value={nuevaHabilidad}
                onChange={(e) => setNuevaHabilidad(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    agregarHabilidad()
                  }
                }}
                placeholder="Ej. React, Python, SQL..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={agregarHabilidad}
                aria-label="Agregar habilidad"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {habilidades.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {habilidades.map((h) => (
                  <Badge
                    key={h}
                    variant="secondary"
                    className="gap-1 pr-1 text-xs font-normal"
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() => quitarHabilidad(h)}
                      className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
                      aria-label={`Quitar ${h}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Crear cuenta
          </Button>
        </form>
      </div>
    </main>
  )
}
