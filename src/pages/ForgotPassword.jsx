import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api.js'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [devToken, setDevToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    setDevToken('')
    setLoading(true)
    try {
      const res = await requestPasswordReset(email)
      setMsg(res.message || 'If that email exists, a reset link has been sent.')
      if (res.devResetToken) setDevToken(res.devResetToken)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="auth-sub">Enter your account email and we'll send a reset link.</p>
        {msg && <p className="form-ok">{msg}</p>}
        {error && <p className="form-error">{error}</p>}
        {devToken && (
          <p className="form-note">
            Dev mode — use this token: <code>{devToken}</code>{' '}
            <Link to={`/reset?token=${devToken}`}>Go to reset</Link>
          </p>
        )}
        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="auth-alt">
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
