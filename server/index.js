import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { randomUUID, randomBytes } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  initSchema,
  run,
  get,
  all,
  insertReturningId,
  DATABASE_URL,
} from './db.js'
import { hashPassword, verifyPassword, signToken, verifyToken } from './auth.js'
import { sendMail, mailerEnabled } from './mail.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PORT = process.env.PORT || 3001
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const genId = (prefix) =>
  prefix + '-' + randomUUID().split('-')[0].toUpperCase()

function optionalAuth(req, _res, next) {
  const h = req.headers.authorization
  if (h && h.startsWith('Bearer ')) {
    try {
      req.userId = verifyToken(h.slice(7)).sub
    } catch {
      req.userId = undefined
    }
  }
  next()
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    req.userId = verifyToken(h.slice(7)).sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

async function requireAdmin(req, res, next) {
  const h = req.headers.authorization
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const userId = verifyToken(h.slice(7)).sub
    const row = await get('SELECT id, role FROM users WHERE id = ?', [userId])
    if (!row || row.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    req.userId = userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => {
  const b = req.body || {}
  const name = String(b.name || '').trim()
  const email = String(b.email || '').trim().toLowerCase()
  const password = String(b.password || '')
  const phone = String(b.phone || '')
  if (!name || !email || password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Name, valid email and password (min 6 chars) required' })
  }
  const existing = await get('SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  const password_hash = await hashPassword(password)
  const id = await insertReturningId(
    'INSERT INTO users (name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, password_hash, new Date().toISOString()],
  )
  const user = { id, name, email, phone, role: 'customer' }
  res.status(201).json({ token: signToken(user), user })
})

app.post('/api/auth/login', async (req, res) => {
  const b = req.body || {}
  const email = String(b.email || '').trim().toLowerCase()
  const password = String(b.password || '')
  const row = await get('SELECT * FROM users WHERE email = ?', [email])
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
  }
  res.json({ token: signToken(user), user })
})

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const row = await get(
    'SELECT id, name, email, phone, role FROM users WHERE id = ?',
    [req.userId],
  )
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

// ---------- Password reset ----------
app.post('/api/auth/request-reset', async (req, res) => {
  const email = String((req.body && req.body.email) || '')
    .trim()
    .toLowerCase()
  const row = await get('SELECT id FROM users WHERE email = ?', [email])
  // Always respond the same to avoid leaking which emails exist
  const token = randomBytes(20).toString('hex')
  const expiry = new Date(Date.now() + 3600 * 1000).toISOString()
  if (row) {
    await run('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [
      token,
      expiry,
      row.id,
    ])
  }
  const base = process.env.APP_BASE_URL || `http://localhost:${PORT}`
  const link = `${base}/reset?token=${token}`
  let emailed = false
  if (row && mailerEnabled()) {
    try {
      await sendMail({
        to: email,
        subject: "Amy's Kitchen — Reset your password",
        text: `We received a request to reset your password.\n\nReset link (valid 1 hour):\n${link}\n\nIf you didn't request this, ignore this email.`,
        html: `<p>We received a request to reset your password.</p><p><a href="${link}">Reset your password</a> (valid for 1 hour).</p><p>If you didn't request this, you can ignore this email.</p>`,
      })
      emailed = true
    } catch (e) {
      console.error('Mail send failed:', e.message)
    }
  }
  const out = { message: 'If that email exists, a reset link has been sent.' }
  if (!emailed && process.env.NODE_ENV !== 'production' && row) {
    out.devResetToken = token // dev only: lets you test without a real mailbox
  }
  res.json(out)
})

app.post('/api/auth/reset', async (req, res) => {
  const token = String((req.body && req.body.token) || '')
  const password = String((req.body && req.body.password) || '')
  if (!token || password.length < 6) {
    return res.status(400).json({ error: 'Token and new password (min 6) required' })
  }
  const row = await get('SELECT * FROM users WHERE reset_token = ?', [token])
  if (!row || !row.reset_token_expiry || new Date(row.reset_token_expiry) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }
  const password_hash = await hashPassword(password)
  await run(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [password_hash, row.id],
  )
  res.json({ message: 'Password updated. You can now sign in.' })
})

// ---------- Admin ----------
app.get('/api/admin/reservations', requireAdmin, async (_req, res) => {
  const rows = await all('SELECT * FROM reservations ORDER BY created_at DESC')
  res.json(rows)
})

app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  const rows = await all('SELECT * FROM orders ORDER BY created_at DESC')
  res.json(rows)
})

app.patch('/api/admin/reservations/:id', requireAdmin, async (req, res) => {
  const status = String((req.body && req.body.status) || '')
  const ok = await run('UPDATE reservations SET status = ? WHERE id = ?', [
    status,
    req.params.id,
  ])
  if (!ok) return res.status(404).json({ error: 'Not found' })
  const row = await get('SELECT * FROM reservations WHERE id = ?', [req.params.id])
  res.json(row)
})

app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const status = String((req.body && req.body.status) || '')
  const ok = await run('UPDATE orders SET status = ? WHERE id = ?', [
    status,
    req.params.id,
  ])
  if (!ok) return res.status(404).json({ error: 'Not found' })
  const row = await get('SELECT * FROM orders WHERE id = ?', [req.params.id])
  res.json(row)
})

// ---------- Reservations ----------
app.post('/api/reservations', optionalAuth, async (req, res) => {
  const b = req.body || {}
  const required = ['name', 'email', 'phone', 'date', 'time', 'guests']
  for (const f of required) {
    if (b[f] === undefined || b[f] === '') {
      return res.status(400).json({ error: `Missing field: ${f}` })
    }
  }
  const record = {
    id: genId('RES'),
    user_id: req.userId || null,
    name: String(b.name),
    email: String(b.email),
    phone: String(b.phone),
    date: String(b.date),
    time: String(b.time),
    guests: Number(b.guests),
    seating: String(b.seating || 'any'),
    requests: String(b.requests || ''),
    status: 'Confirmed',
    created_at: new Date().toISOString(),
  }
  await run(
    `INSERT INTO reservations
     (id, user_id, name, email, phone, date, time, guests, seating, requests, status, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      record.id,
      record.user_id,
      record.name,
      record.email,
      record.phone,
      record.date,
      record.time,
      record.guests,
      record.seating,
      record.requests,
      record.status,
      record.created_at,
    ],
  )
  res.status(201).json(record)
})

app.get('/api/reservations/me', requireAuth, async (req, res) => {
  const rows = await all(
    'SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
  )
  res.json(rows)
})

app.get('/api/reservations/:id', async (req, res) => {
  const row = await get('SELECT * FROM reservations WHERE id = ?', [req.params.id])
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

// ---------- Orders ----------
app.post('/api/orders', optionalAuth, async (req, res) => {
  const b = req.body || {}
  if (!Array.isArray(b.items) || b.items.length === 0) {
    return res.status(400).json({ error: 'Order must contain items' })
  }
  if (!b.customer || !b.customer.name) {
    return res.status(400).json({ error: 'Missing customer name' })
  }
  const record = {
    id: genId('ORD'),
    user_id: req.userId || null,
    items: JSON.stringify(b.items),
    total: Number(b.total) || 0,
    customer: JSON.stringify(b.customer),
    fulfillment: String(b.customer.fulfillment || 'pickup'),
    delivery_fee: Number(b.customer.deliveryFee) || 0,
    status: 'Received',
    created_at: new Date().toISOString(),
  }
  await run(
    `INSERT INTO orders
     (id, user_id, items, total, customer, fulfillment, delivery_fee, status, created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      record.id,
      record.user_id,
      record.items,
      record.total,
      record.customer,
      record.fulfillment,
      record.delivery_fee,
      record.status,
      record.created_at,
    ],
  )
  res.status(201).json(record)
})

app.get('/api/orders/me', requireAuth, async (req, res) => {
  const rows = await all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
  )
  res.json(rows)
})

app.get('/api/orders/:id', async (req, res) => {
  const row = await get('SELECT * FROM orders WHERE id = ?', [req.params.id])
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

app.get('/api/health', async (_req, res) => {
  res.json({
    ok: true,
    db: DATABASE_URL ? 'postgres' : 'sqlite',
    time: new Date().toISOString(),
  })
})

// Serve the built SPA
const dist = join(ROOT, 'dist')
app.use(express.static(dist))

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return
  const existing = await get('SELECT id FROM users WHERE email = ?', [
    ADMIN_EMAIL.trim().toLowerCase(),
  ])
  const password_hash = await hashPassword(ADMIN_PASSWORD)
  if (existing) {
    await run('UPDATE users SET role = ?, password_hash = ? WHERE id = ?', [
      'admin',
      password_hash,
      existing.id,
    ])
  } else {
    await insertReturningId(
      'INSERT INTO users (name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'Administrator',
        ADMIN_EMAIL.trim().toLowerCase(),
        '',
        password_hash,
        'admin',
        new Date().toISOString(),
      ],
    )
  }
  console.log(`Admin account ready: ${ADMIN_EMAIL}`)
}

initSchema()
  .then(seedAdmin)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Amy's Kitchen server on http://localhost:${PORT} (db: ${
          DATABASE_URL ? 'postgres' : 'sqlite'
        })`,
      )
    })
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err)
    process.exit(1)
  })
