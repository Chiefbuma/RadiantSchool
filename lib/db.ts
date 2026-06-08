import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var rhtiPgPool: Pool | undefined;
}

function getPool() {
  if (globalThis.rhtiPgPool) {
    return globalThis.rhtiPgPool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString });

  if (process.env.NODE_ENV !== "production") {
    globalThis.rhtiPgPool = pool;
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  return getPool().query<T>(text, params);
}
