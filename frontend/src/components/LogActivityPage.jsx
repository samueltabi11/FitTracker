import { useState, useEffect } from 'react'
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'
import { extractErrorMessage } from '../utils/errors'
import ConfirmModal from './ConfirmModal'

const ACTIVITY_URL = `${API_BASE_URL}/api/activity/`

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function LogActivityPage() {
  const [date, setDate] = useState(todayDate())
  const [steps, setSteps] = useState('')
  const [caloriesBurned, setCaloriesBurned] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [activities, setActivities] = useState([])
  const [historyError, setHistoryError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editSteps, setEditSteps] = useState('')
  const [editCalories, setEditCalories] = useState('')

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchActivities = async () => {
    try {
      const response = await authFetch(ACTIVITY_URL)

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setHistoryError(extractErrorMessage(data, 'Could not load activity history'))
        return
      }

      setActivities(await response.json())
    } catch {
      setHistoryError('Could not reach the server, please try again')
    }
  }

  // guests have no real token to authenticate with, so skip the fetch and just show an empty list
  useEffect(() => {
    if (isAuthenticated()) {
      fetchActivities()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      setError('Sign in to log activity')
      return
    }
    setError('')
    setSuccess('')

    try {
      const response = await authFetch(ACTIVITY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date,
          steps: parseInt(steps),
          calories_burned: parseFloat(caloriesBurned)
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(extractErrorMessage(data, 'Could not save activity'))
        return
      }

      setSuccess('Activity logged!')
      setDate(todayDate())
      setSteps('')
      setCaloriesBurned('')
      fetchActivities()
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  const startEdit = (activity) => {
    setHistoryError('')
    setEditingId(activity.id)
    setEditSteps(String(activity.steps))
    setEditCalories(activity.calories_burned != null ? String(activity.calories_burned) : '')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id) => {
    setHistoryError('')

    try {
      const response = await authFetch(`${ACTIVITY_URL}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: parseInt(editSteps),
          calories_burned: parseFloat(editCalories)
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setHistoryError(extractErrorMessage(data, 'Could not update activity'))
        return
      }

      setEditingId(null)
      fetchActivities()
    } catch {
      setHistoryError('Could not reach the server, please try again')
    }
  }

  const handleDeleteClick = (id) => {
    if (!isAuthenticated()) {
      setHistoryError('Sign in to manage activity')
      return
    }
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    setHistoryError('')

    try {
      const response = await authFetch(`${ACTIVITY_URL}${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setHistoryError(extractErrorMessage(data, 'Could not delete activity'))
        return
      }

      setActivities((prev) => prev.filter((activity) => activity.id !== id))
    } catch {
      setHistoryError('Could not reach the server, please try again')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2>Log Activity</h2>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <div>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Steps</label>
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Calories Burned</label>
          <input
            type="number"
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(e.target.value)}
            required
          />
        </div>

        <button type="submit">Save Activity</button>
      </form>

      <div className="history">
        <h2>Activity History</h2>

        {historyError && <p className="form-error">{historyError}</p>}

        <div className="history-list">
          {activities.map((activity) => (
            <div className="workout-card" key={activity.id}>
              {editingId === activity.id ? (
                <>
                  <div className="workout-card-header">
                    <span className="workout-name">{formatDate(activity.date)}</span>
                  </div>
                  <div className="workout-edit-field">
                    <label>Steps</label>
                    <input
                      type="number"
                      value={editSteps}
                      onChange={(e) => setEditSteps(e.target.value)}
                      required
                    />
                  </div>
                  <div className="workout-edit-field">
                    <label>Calories Burned</label>
                    <input
                      type="number"
                      value={editCalories}
                      onChange={(e) => setEditCalories(e.target.value)}
                      required
                    />
                  </div>
                  <div className="workout-card-header">
                    <button type="button" className="btn-primary" onClick={() => saveEdit(activity.id)}>
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="workout-card-header">
                    <span className="workout-name">{formatDate(activity.date)}</span>
                    <button type="button" onClick={() => startEdit(activity)}>
                      Edit
                    </button>
                    <button type="button" className="btn-danger" onClick={() => handleDeleteClick(activity.id)}>
                      Delete
                    </button>
                  </div>
                  <div className="workout-meta">
                    {activity.steps} steps · {activity.calories_burned ?? 0} cal
                  </div>
                </>
              )}
            </div>
          ))}
          {activities.length === 0 && (
            <div className="history-empty">No activity logged yet.</div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Delete this activity entry?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}

export default LogActivityPage
