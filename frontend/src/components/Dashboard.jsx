import { Link } from 'react-router-dom'

function Dashboard() {
  // just a placeholder landing page for now, real dashboard stuff (stats, history, etc) comes later
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <Link to="/log-strength">
        <button type="button">Log Strength</button>
      </Link>
      <Link to="/log-cardio">
        <button type="button">Log Cardio</button>
      </Link>
      <Link to="/goals">
        <button type="button">Goals</button>
      </Link>
      <Link to="/progress">
        <button type="button">Progress</button>
      </Link>
    </div>
  )
}

export default Dashboard
