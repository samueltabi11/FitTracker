import { useState, useEffect } from 'react'
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'

const WORKOUTS_URL = `${API_BASE_URL}/api/workouts/`

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function HistoryPage() {
  const [workouts, setWorkouts] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const fetchWorkouts = async () => {
    try {
      const response = await authFetch(WORKOUTS_URL)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || JSON.stringify(data) || 'Could not load workouts')
        return
      }

      setWorkouts(await response.json())
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  // guests have no real token to authenticate with, so skip the fetch and just show an empty list
  useEffect(() => {
    if (isAuthenticated()) {
      fetchWorkouts()
    }
  }, [])

  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!isAuthenticated()) {
      setError('Sign in to manage workouts')
      return
    }
    if (!window.confirm('Delete this workout?')) {
      return
    }
    setError('')

    try {
      const response = await authFetch(`${WORKOUTS_URL}${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || JSON.stringify(data) || 'Could not delete workout')
        return
      }

      setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  return (
    <div className="history">
      {error && <p className="form-error">{error}</p>}

      <div className="history-search">
        <input
          type="text"
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="history-list">
        {filteredWorkouts.map((workout) => (
          <div className="workout-card" key={workout.id}>
            <div className="workout-card-header">
              <span className="workout-name">{workout.name}</span>
              <button type="button" onClick={() => handleDelete(workout.id)}>
                Delete
              </button>
            </div>
            <div className="workout-meta">
              {formatDate(workout.date)} · {workout.duration_minutes} min ·{' '}
              {workout.exercise_count} exercise{workout.exercise_count === 1 ? '' : 's'}
            </div>
          </div>
        ))}
        {filteredWorkouts.length === 0 && (
          <div className="history-empty">No workouts found.</div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
