"use client"

import { useState } from "react"
import { Loader2, Plus, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/client"
import { toast } from "sonner"

export default function PerfilHabilidades({
  habilidades,
  onChange,
}: {
  habilidades: string[]
  onChange: (nuevas: string[]) => void
}) {
  const [items, setItems] = useState<string[]>(habilidades)
  const [nueva, setNueva] = useState("")
  const [saving, setSaving] = useState(false)

  function add() {
    const valor = nueva.trim()
    if (!valor) return
    if (items.some((i) => i.toLowerCase() === valor.toLowerCase())) {
      toast.info("Esa habilidad ya existe.")
      return
    }
    setItems([...items, valor])
    setNueva("")
  }

  function remove(item: string) {
    setItems(items.filter((i) => i !== item))
  }

  async function guardar() {
    setSaving(true)
    try {
      const data = await apiFetch("/api/perfil", {
        method: "PUT",
        body: JSON.stringify({ habilidades: items }),
      })
      onChange(data.habilidades)
      toast.success("Habilidades actualizadas.")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const cambiado =
    JSON.stringify([...items].sort()) !== JSON.stringify([...habilidades].sort())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mis habilidades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Estas habilidades alimentan el cálculo de compatibilidad por similitud
          de cosenos.
        </p>

        <div className="flex flex-wrap gap-2">
          {items.length === 0 && (
            <span className="text-sm text-muted-foreground">
              Sin habilidades aún.
            </span>
          )}
          {items.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 py-1 pl-2.5 pr-1 text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Quitar ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
            placeholder="Ej. TypeScript"
          />
          <Button type="button" variant="outline" onClick={add}>
            <Plus className="size-4" />
            Añadir
          </Button>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={guardar}
          disabled={!cambiado || saving}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar cambios
        </Button>
      </CardContent>
    </Card>
  )
}
