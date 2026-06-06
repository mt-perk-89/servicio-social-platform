"use client"

import { GraduationCap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar({
  nombre,
  onLogout,
}: {
  nombre: string
  onLogout: () => void
}) {
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary p-1.5 text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
            Servicio Social
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {iniciales}
            </span>
            <span className="text-sm font-medium text-foreground">{nombre}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
