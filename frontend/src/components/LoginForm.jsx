import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOKEN_KEY, continueAsGuest } from '../auth'

function LoginForm() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleGuest = () => {
    continueAsGuest()
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError('Invalid username or password')
        return
      }

      localStorage.setItem(TOKEN_KEY, data.access)
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
