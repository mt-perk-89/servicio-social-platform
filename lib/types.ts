export type Alumno = {
  correo: string
  nombre: string
  habilidades: string[]
  lat: number
  lng: number
}

export type UnidadReceptora = {
  id_unidad: string
  nombre_dependencia: string
  vacantes: number
  tecnologias_requeridas: string[]
  lat: number
  lng: number
}

export type Recomendacion = {
  id_unidad: string
  depe: string
  vacantes: number
  distanciaKm: number
  compatibilidad: number
  tecnologias: string[]
  comunes: string[]
  lat: number
  lng: number
  estado: string | null
}

export type Postulacion = {
  id_unidad: string
  nombre_dependencia: string
  estado: string
  fecha_inicio: string
}
