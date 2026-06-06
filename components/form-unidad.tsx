"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/client"

type Props = {
  onCreada: () => void
}

export function FormUnidad({ onCreada }: Props) {
  const [idUnidad, setIdUnidad] = useState("")
  const [nombre, setNombre] = useState("")
  const [vacantes, setVacantes] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [tecnologias, setTecnologias] = useState("")
  const [loading, setLoading] = useState(false)

  function reset() {
    setIdUnidad("")
    setNombre("")
    setVacantes("")
    setLat("")
    setLng("")
    setTecnologias("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const latNum = Number.parseFloat(lat)
    const lngNum = Number.parseFloat(lng)

    if (!idUnidad.trim() || !nombre.trim()) {
      toast.error("El ID y el nombre de la dependencia son obligatorios")
      return
    }
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      toast.error("Latitud y longitud deben ser números válidos")
      return
    }

    const lista = tecnologias
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)

    setLoading(true)
    try {
      await apiFetch("/api/unidades", {
        method: "POST",
        body: JSON.stringify({
          id_unidad: idUnidad.trim(),
          nombre_dependencia: nombre.trim(),
          vacantes: Number.parseInt(vacantes, 10) || 0,
          tecnologias_requeridas: lista,
          lat: latNum,
          lng: lngNum,
        }),
      })
      toast.success(`Unidad "${nombre.trim()}" dada de alta`)
      reset()
      onCreada()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear la unidad")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="size-5 text-primary" />
          Dar de alta una unidad receptora
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="idUnidad">ID de la unidad</Label>
              <Input
                id="idUnidad"
                value={idUnidad}
                onChange={(e) => setIdUnidad(e.target.value)}
                placeholder="Ej. U6"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vacantes">Vacantes</Label>
              <Input
                id="vacantes"
                value={vacantes}
                onChange={(e) => setVacantes(e.target.value)}
                placeholder="5"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre de la dependencia</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Secretaría de Innovación Digital"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lat">Latitud</Label>
              <Input
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="19.4326"
                inputMode="decimal"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lng">Longitud</Label>
              <Input
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-99.1332"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tecnologias">Tecnologías requeridas</Label>
            <Input
              id="tecnologias"
              value={tecnologias}
              onChange={(e) => setTecnologias(e.target.value)}
              placeholder="JavaScript, React, SQL"
            />
            <p className="text-xs text-muted-foreground">
              Separa las tecnologías requeridas con comas
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Dar de alta
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
