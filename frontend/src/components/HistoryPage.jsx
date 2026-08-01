import { useState, useEffect } from 'react'
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'
import { extractErrorMessage } from '../utils/errors'
import { kgToLbs, kmToMiles } from '../utils/units'
import ConfirmModal from './ConfirmModal'

const WORKOUTS_URL = `${API_BASE_URL}/api/workouts/`
const EXERCISES_URL = `${API_BASE_URL}/api/exercises/`

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

// The workout detail response only carries raw values (reps/weight_kg for
// strength sets, distance_km for cardio) - render whichever are present
// rather than assuming one shape.
function formatSet(set) {
  const parts = []
  if (set.reps != null) parts.push(`${set.reps} reps`)
  if (set.weight_kg != null) parts.push(`${kgToLbs(set.weight_kg)} lbs`)
  if (set.distance_km != null) parts.push(`${kmToMiles(set.distance_km)} mi`)
  if (set.duration_seconds != null) parts.push(`${set.duration_seconds}s`)
  return parts.length > 0 ? parts.join(' · ') : 'No data'
}

function HistoryPage() {
  const [workouts, setWorkouts] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const [expandedId, setExpandedId] = useState(null)
  const [workoutDetails, setWorkoutDetails] = useState({})
  const [exerciseNames, setExerciseNames] = useState({})
  const [loadingId, setLoadingId] = useState(null)
  const [detailError, setDetailError] = useState('')

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

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    setExpandedId(id)
    setDetailError('')

    // already fetched this one on a previous expand - reuse it
    if (workoutDetails[id]) {
      return
    }

    setLoadingId(id)
    try {
      const response = await authFetch(`${WORKOUTS_URL}${id}/`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setDetailError(extractErrorMessage(data, 'Could not load workout details'))
        return
      }

      const detail = await response.json()
      setWorkoutDetails((prev) => ({ ...prev, [id]: detail }))

      const unresolvedIds = [...new Set(detail.exercises.map((ex) => ex.exercise))].filter(
        (exerciseId) => !(exerciseId in exerciseNames)
      )

      if (unresolvedIds.length > 0) {
        const resolved = await Promise.all(
          unresolvedIds.map(async (exerciseId) => {
            const exResponse = await authFetch(`${EXERCISES_URL}${exerciseId}/`)
            if (!exResponse.ok) return [exerciseId, `Exercise #${exerciseId}`]
            const exData = await exResponse.json()
            return [exerciseId, exData.name]
          })
        )
        setExerciseNames((prev) => ({ ...prev, ...Object.fromEntries(resolved) }))
      }
    } catch {
      setDetailError('Could not reach the server, please try again')
    } finally {
      setLoadingId(null)
    }
  }

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
        {filteredWorkouts.map((workout) => {
          const isExpanded = expandedId === workout.id
          const detail = workoutDetails[workout.id]

          return (
            <div className="workout-card" key={workout.id}>
              <div className="workout-card-header">
                <button type="button" className="workout-toggle" onClick={() => toggleExpand(workout.id)}>
                  <span className="workout-expand-icon">{isExpanded ? '▾' : '▸'}</span>
                  <span className="workout-name">{workout.name}</span>
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDeleteClick(workout.id)}>
                  Delete
                </button>
              </div>
              <div className="workout-meta">
                {formatDate(workout.date)} · {workout.duration_minutes} min ·{' '}
                {workout.exercise_count} exercise{workout.exercise_count === 1 ? '' : 's'}
              </div>

              {isExpanded && (
                <div className="workout-detail">
                  {loadingId === workout.id && (
                    <p className="workout-detail-loading">Loading details…</p>
                  )}

                  {detailError && loadingId !== workout.id && (
                    <p className="form-error">{detailError}</p>
                  )}

                  {detail && loadingId !== workout.id && (
                    <>
                      {detail.exercises.map((ex) => (
                        <div className="workout-exercise" key={ex.id}>
                          <div className="workout-exercise-name">
                            {exerciseNames[ex.exercise] || 'Exercise'}
                          </div>
                          <ul className="workout-sets">
                            {ex.sets.map((set) => (
                              <li key={set.id}>
                                Set {set.set_number}: {formatSet(set)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {detail.notes && <p className="workout-detail-notes">{detail.notes}</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
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
