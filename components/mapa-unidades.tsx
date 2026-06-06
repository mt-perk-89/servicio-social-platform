"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Recomendacion } from "@/lib/types"

// Iconos personalizados (Leaflet no resuelve sus PNG por defecto con bundlers).
const alumnoIcon = L.divIcon({
  className: "",
  html: `<div style="background:oklch(0.5 0.13 250);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px oklch(0.5 0.13 250)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function unidadIcon(comp: number) {
  const color =
    comp >= 60 ? "oklch(0.55 0.16 150)" : comp >= 30 ? "oklch(0.7 0.14 180)" : "oklch(0.55 0.02 250)"
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 14],
  })
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  // react-leaflet v5: usar hook vía componente hijo no es necesario aquí; el center inicial basta.
  useEffect(() => {}, [lat, lng])
  return null
}

export default function MapaUnidades({
  alumno,
  unidades,
}: {
  alumno: { lat: number; lng: number; nombre: string }
  unidades: Recomendacion[]
}) {
  return (
    <MapContainer
      center={[alumno.lat, alumno.lng]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <Recenter lat={alumno.lat} lng={alumno.lng} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Radio de 10 km */}
      <Circle
        center={[alumno.lat, alumno.lng]}
        radius={10000}
        pathOptions={{
          color: "oklch(0.5 0.13 250)",
          fillColor: "oklch(0.5 0.13 250)",
          fillOpacity: 0.06,
          weight: 1,
        }}
      />
      <Marker position={[alumno.lat, alumno.lng]} icon={alumnoIcon}>
        <Popup>Tú: {alumno.nombre}</Popup>
      </Marker>
      {unidades.map((u) => (
        <Marker
          key={u.id_unidad}
          position={[u.lat, u.lng]}
          icon={unidadIcon(u.compatibilidad)}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{u.depe}</p>
              <p className="text-xs">Compatibilidad: {u.compatibilidad}%</p>
              <p className="text-xs">Distancia: {u.distanciaKm} km</p>
              <p className="text-xs">Vacantes: {u.vacantes}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
