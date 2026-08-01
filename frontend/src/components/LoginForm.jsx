import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, GUEST_KEY, hasAccess, continueAsGuest } from '../auth'

function LoginForm() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // already signed in (real or guest) — visiting /login directly shouldn't be
  // possible to re-enter through, since that's how guest/real tokens end up mixed
  if (hasAccess()) {
    return <Navigate to="/" replace />
  }

  const handleGuest = () => {
    continueAsGuest()
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError('Incorrect username or password')
        return
      }

      localStorage.removeItem(GUEST_KEY)
      localStorage.setItem(TOKEN_KEY, data.access)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
      navigate('/')
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <p className="form-error">{error}</p>}

      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">Log In</button>
      <button type="button" onClick={handleGuest}>
        Continue as Guest
      </button>
    </form>
  )
}

export default LoginForm
