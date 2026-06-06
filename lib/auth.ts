import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me",
)

export type SessionPayload = {
  correo: string
  nombre: string
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      correo: payload.correo as string,
      nombre: payload.nombre as string,
    }
  } catch {
    return null
  }
}

/** Extracts and verifies the bearer token from a request's Authorization header. */
export async function getSession(
  request: Request,
): Promise<SessionPayload | null> {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) return null
  const token = header.slice("Bearer ".length)
  return verifyToken(token)
}
