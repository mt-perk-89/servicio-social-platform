"use client"

import { useState } from "react"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/client"

type Props = {
  onCreado?: () => void
}

export function FormAlumno({ onCreado }: Props) {
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [habilidades, setHabilidades] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [loading, setLoading] = useState(false)

  function reset() {
    setNombre("")
    setCorreo("")
    setPassword("")
    setHabilidades("")
    setLat("")
    setLng("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nombre.trim() || !correo.trim() || !password) {
      toast.error("Nombre, correo y contraseña son obligatorios")
      return
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const lista = habilidades
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)

    const payload: Record<string, unknown> = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      password,
      habilidades: lista,
    }

    const latNum = Number.parseFloat(lat)
    const lngNum = Number.parseFloat(lng)
    if (!Number.isNaN(latNum)) payload.lat = latNum
    if (!Number.isNaN(lngNum)) payload.lng = lngNum

    setLoading(true)
    try {
      await apiFetch("/api/alumnos", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      toast.success(`Alumno "${nombre.trim()}" dado de alta`)
      reset()
      onCreado?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear el alumno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="size-5 text-primary" />
          Dar de alta un alumno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="alumno-nombre">Nombre completo</Label>
            <Input
              id="alumno-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Laura Hernández"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="alumno-correo">Correo</Label>
              <Input
                id="alumno-correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="alumno@uni.edu"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="alumno-password">Contraseña</Label>
              <Input
                id="alumno-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="alumno-habilidades">Habilidades</Label>
            <Input
              id="alumno-habilidades"
              value={habilidades}
              onChange={(e) => setHabilidades(e.target.value)}
              placeholder="JavaScript, React, SQL"
            />
            <p className="text-xs text-muted-foreground">
              Separa las habilidades con comas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="alumno-lat">Latitud (opcional)</Label>
              <Input
                id="alumno-lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="19.4326"
                inputMode="decimal"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="alumno-lng">Longitud (opcional)</Label>
              <Input
                id="alumno-lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-99.1332"
                inputMode="decimal"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Dar de alta alumno
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
