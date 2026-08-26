import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api.js'
import './Auth.css'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="container auth-wrap">
        <div className="auth-card">
          <h1>Password updated</h1>
          <p className="auth-sub">You can now sign in with your new password.</p>
          <Link to="/login" className="btn">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <h1>Choose a new password</h1>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={submit} className="auth-form">
          <label>
            Reset token
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              placeholder="Paste the token from your email"
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
