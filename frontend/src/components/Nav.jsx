import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { hasAccess, logout } from '../auth'

function Nav() {
  const navigate = useNavigate()
  // subscribes Nav to route changes so it re-checks the token right after login/logout redirects
  useLocation()

  const loggedIn = hasAccess()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav>
      {loggedIn ? (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/log-strength">Log Strength</NavLink>
          <NavLink to="/log-cardio">Log Cardio</NavLink>
          <NavLink to="/goals">Goals</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/history">History</NavLink>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </nav>
  )
}

export default Nav
