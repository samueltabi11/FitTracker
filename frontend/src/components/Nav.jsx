import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { hasAccess, logout } from '../auth'
import logo from '../assets/FitTrackerlogo.png'

function Nav() {
  const navigate = useNavigate()
  // subscribes Nav to route changes so it re-checks the token right after login/logout redirects
  useLocation()

  const loggedIn = hasAccess()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Only authenticated/guest users have a Dashboard to go to - for anyone else
  // the logo is just a mark, not a link.
  const goToDashboard = () => {
    if (loggedIn) {
      navigate('/')
    }
  }

  return (
    <nav>
      <img
        src={logo}
        alt="FitTracker"
        className={loggedIn ? 'nav-logo nav-logo-clickable' : 'nav-logo'}
        onClick={goToDashboard}
      />

      <div className="nav-links">
        {loggedIn ? (
          <>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/log-strength">Log Strength</NavLink>
            <NavLink to="/log-cardio">Log Cardio</NavLink>
            <NavLink to="/log-activity">Log Activity</NavLink>
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/progress">Progress</NavLink>
            <NavLink to="/history">History</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>

      {loggedIn && (
        <button type="button" className="nav-logout" onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  )
}

export default Nav
