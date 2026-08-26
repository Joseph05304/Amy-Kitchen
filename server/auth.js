import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const TOKEN_TTL = '7d'

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
