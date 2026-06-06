import neo4j, { type Driver } from "neo4j-driver"

// Reuse a single driver instance across hot reloads / serverless invocations.
const globalForNeo4j = globalThis as unknown as { neo4jDriver?: Driver }

function createDriver(): Driver {
  const uri = process.env.NEO4J_URI
  const username = process.env.NEO4J_USERNAME
  const password = process.env.NEO4J_PASSWORD

  if (!uri || !username || !password) {
    throw new Error(
      "Faltan variables de entorno de Neo4j (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD).",
    )
  }

  return neo4j.driver(uri, neo4j.auth.basic(username, password), {
    disableLosslessIntegers: true,
  })
}

export function getDriver(): Driver {
  if (!globalForNeo4j.neo4jDriver) {
    globalForNeo4j.neo4jDriver = createDriver()
  }
  return globalForNeo4j.neo4jDriver
}

const DATABASE = process.env.NEO4J_DATABASE || "neo4j"

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const driver = getDriver()
  const session = driver.session({ database: DATABASE })
  try {
    const result = await session.run(cypher, params)
    return result.records.map((record) => record.toObject() as T)
  } finally {
    await session.close()
  }
}
