import { NavLink } from 'react-router-dom'

function Nav() {
  // using NavLink instead of Link so the active page gets highlighted automatically
  return (
    <nav>
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/log-strength">Log Strength</NavLink>
      <NavLink to="/log-cardio">Log Cardio</NavLink>
    </nav>
  )
}

export default Nav
