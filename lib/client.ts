const TOKEN_KEY = "ss_token"
const ALUMNO_KEY = "ss_alumno"

export type StoredAlumno = {
  correo: string
  nombre: string
  rol?: "alumno" | "admin"
}

export function saveSession(token: string, alumno: StoredAlumno) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ALUMNO_KEY, JSON.stringify(alumno))
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getAlumno(): StoredAlumno | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(ALUMNO_KEY)
  return raw ? (JSON.parse(raw) as StoredAlumno) : null
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ALUMNO_KEY)
}

/** Fetch wrapper that attaches the JWT bearer token automatically. */
export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (init.body) headers.set("Content-Type", "application/json")

  const res = await fetch(input, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Error en la solicitud.")
  }
  return data
}
