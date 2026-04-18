import { DurableObject } from "cloudflare:workers";

export interface CacheRecord {
  value: string;
  fetchedAt: number;
  expiresAt: number;
}

interface CacheRow extends Record<string, SqlStorageValue> {
  value: string;
  fetched_at: number;
  expires_at: number;
}

interface VersionRow extends Record<string, SqlStorageValue> {
  version: number;
}

export class MetadataCache extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initSchema();
  }

  private initSchema(): void {
    const sql = this.ctx.storage.sql;

    sql.exec(`
      CREATE TABLE IF NOT EXISTS _sql_schema_migrations (
        id INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const version = sql
      .exec<VersionRow>("SELECT COALESCE(MAX(id), 0) AS version FROM _sql_schema_migrations")
      .one().version;

    if (version < 1) {
      sql.exec(`
        CREATE TABLE IF NOT EXISTS cache_entries (
          key        TEXT PRIMARY KEY,
          value      TEXT    NOT NULL,
          expires_at INTEGER NOT NULL,
          fetched_at INTEGER NOT NULL
        )
      `);
      sql.exec("CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache_entries(expires_at)");
      sql.exec("INSERT INTO _sql_schema_migrations (id) VALUES (1)");
    }
  }

  async get(key: string): Promise<CacheRecord | null> {
    const rows = this.ctx.storage.sql
      .exec<CacheRow>("SELECT value, fetched_at, expires_at FROM cache_entries WHERE key = ?", key)
      .toArray();
    const row = rows[0];
    if (!row) return null;
    return {
      value: row.value,
      fetchedAt: row.fetched_at,
      expiresAt: row.expires_at,
    };
  }

  async put(key: string, value: string, ttlSeconds: number): Promise<void> {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO cache_entries (key, value, expires_at, fetched_at) VALUES (?, ?, ?, ?)",
      key,
      value,
      expiresAt,
      now,
    );
  }
}
