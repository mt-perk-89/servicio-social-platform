import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { runQuery } from "@/lib/neo4j"
import { createToken } from "@/lib/auth"

type AlumnoRow = {
  correo: string
  nombre: string
  password: string
}

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json()

    if (!correo || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios." },
        { status: 400 },
      )
    }

    const rows = await runQuery<AlumnoRow>(
      `MATCH (a:Alumno {correo: $correo})
       RETURN a.correo AS correo, a.nombre AS nombre, a.password AS password`,
      { correo },
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      )
    }

    const alumno = rows[0]
    const valid = await bcrypt.compare(password, alumno.password)

    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      )
    }

    const token = await createToken({
      correo: alumno.correo,
      nombre: alumno.nombre,
    })

    return NextResponse.json({
      token,
      alumno: { correo: alumno.correo, nombre: alumno.nombre },
    })
  } catch (error) {
    console.error("[v0] Error en login:", error)
    return NextResponse.json(
      { error: "Error del servidor. ¿Sembraste la base de datos?" },
      { status: 500 },
    )
  }
}
