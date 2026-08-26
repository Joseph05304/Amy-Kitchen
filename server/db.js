import Database from 'better-sqlite3'
import pg from 'pg'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

export const DATABASE_URL = process.env.DATABASE_URL
export const usePg = !!DATABASE_URL

let sqliteDb
let pgPool

if (usePg) {
  pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  })
} else {
  sqliteDb = new Database(process.env.DB_PATH || join(ROOT, 'restaurant.db'))
  sqliteDb.pragma('journal_mode = WAL')
}

const sqliteSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    reset_token TEXT,
    reset_token_expiry TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    name TEXT, email TEXT, phone TEXT,
    date TEXT, time TEXT, guests INTEGER, seating TEXT, requests TEXT,
    status TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    items TEXT, total REAL, customer TEXT,
    fulfillment TEXT, delivery_fee REAL, status TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`

const pgSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    reset_token TEXT,
    reset_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT, email TEXT, phone TEXT,
    date TEXT, time TEXT, guests INTEGER, seating TEXT, requests TEXT,
    status TEXT, created_at TIMESTAMPTZ DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    items JSONB, total NUMERIC, customer JSONB,
    fulfillment TEXT, delivery_fee NUMERIC, status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
`

export async function initSchema() {
  if (usePg) {
    await pgPool.query(pgSchema)
  } else {
    sqliteDb.exec(sqliteSchema)
  }
}

function convert(sql) {
  // better-sqlite3 uses ? placeholders; pg uses $1, $2, ...
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

export async function run(sql, params = []) {
  if (usePg) {
    const r = await pgPool.query(convert(sql), params)
    return r.rowCount
  }
  const info = sqliteDb.prepare(sql).run(...params)
  return info.changes
}

export async function get(sql, params = []) {
  if (usePg) {
    const r = await pgPool.query(convert(sql), params)
    return r.rows[0] || null
  }
  return sqliteDb.prepare(sql).get(...params)
}

export async function all(sql, params = []) {
  if (usePg) {
    const r = await pgPool.query(convert(sql), params)
    return r.rows
  }
  return sqliteDb.prepare(sql).all(...params)
}

export async function insertReturningId(sql, params = []) {
  if (usePg) {
    const r = await pgPool.query(convert(sql) + ' RETURNING id', params)
    return r.rows[0].id
  }
  const info = sqliteDb.prepare(sql).run(...params)
  return info.lastInsertRowid
}

export { pgPool, sqliteDb }
