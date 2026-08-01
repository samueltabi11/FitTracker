import { useState, useEffect } from 'react'
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'
import { extractErrorMessage } from '../utils/errors'
import ConfirmModal from './ConfirmModal'

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
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchWorkouts = async () => {
    try {
      const response = await authFetch(WORKOUTS_URL)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not load workouts'))
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

  const handleDeleteClick = (id) => {
    if (!isAuthenticated()) {
      setError('Sign in to manage workouts')
      return
    }
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    setError('')

    try {
      const response = await authFetch(`${WORKOUTS_URL}${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not delete workout'))
        return
      }

      setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  return (
    <div className="history">
      <h2>Workout History</h2>

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
              <button type="button" className="btn-danger" onClick={() => handleDeleteClick(workout.id)}>
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

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Delete this workout?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default HistoryPage
