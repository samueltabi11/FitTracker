import { useState, useEffect } from 'react'
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'
import { extractErrorMessage } from '../utils/errors'
import ConfirmModal from './ConfirmModal'

const GOAL_TYPES = [
  { value: 'daily_steps', label: 'Daily Steps' },
  { value: 'weekly_workouts', label: 'Weekly Workouts' }
]

// Includes goal types not offered in the create form (e.g. created via the API)
// so existing goals of those types still get a readable label.
const GOAL_TYPE_LABELS = {
  daily_steps: 'Daily Steps',
  weekly_workouts: 'Weekly Workouts',
  weekly_calories: 'Weekly Calories',
  target_weight: 'Target Weight'
}

const GOALS_URL = `${API_BASE_URL}/api/goals/`

function GoalsPage() {
  const [goalType, setGoalType] = useState(GOAL_TYPES[0].value)
  const [targetValue, setTargetValue] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const [goals, setGoals] = useState([])
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // The list endpoint returns whatever current_value/progress_percentage was last
  // stored, which is stale for goal types the backend recalculates on demand
  // (weekly_workouts, daily_steps, weekly_calories - see GoalProgressView).
  // target_weight isn't recalculated server-side, so it's left alone.
  const RECALCULATED_GOAL_TYPES = ['weekly_workouts', 'daily_steps', 'weekly_calories']

  const fetchGoalProgress = async (goal) => {
    try {
      const response = await authFetch(`${GOALS_URL}${goal.id}/progress/`)
      if (!response.ok) return

      const progress = await response.json()
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, ...progress } : g)))
    } catch {
      // leave the stale value in place if this particular refresh fails
    }
  }

  const fetchGoals = async () => {
    try {
      const response = await authFetch(GOALS_URL)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not load goals'))
        return
      }

      const data = await response.json()
      setGoals(data)

      data
        .filter((goal) => RECALCULATED_GOAL_TYPES.includes(goal.goal_type))
        .forEach(fetchGoalProgress)
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  // guests have no real token to authenticate with, so skip the fetch and just show an empty list
  useEffect(() => {
    if (isAuthenticated()) {
      fetchGoals()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      setError('Sign in to save goals')
      return
    }
    setError('')

    const goalData = {
      goal_type: goalType,
      target_value: parseFloat(targetValue),
      target_date: targetDate
    }

    try {
      const response = await authFetch(GOALS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not save goal, please check the form and try again'))
        return
      }

      setTargetValue('')
      setTargetDate('')
      fetchGoals()
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  const handleDeleteClick = (id) => {
    if (!isAuthenticated()) {
      setError('Sign in to manage goals')
      return
    }
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    setError('')

    try {
      const response = await authFetch(`${GOALS_URL}${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not delete goal'))
        return
      }

      setGoals((prev) => prev.filter((goal) => goal.id !== id))
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  return (
    <div className="goals">
      <form onSubmit={handleSubmit}>
        <h2>Set a Goal</h2>

        {error && <p className="form-error">{error}</p>}

        <div>
          <label>Goal Type</label>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
          >
            {GOAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Target Value</label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </div>

        <button type="submit">Save Goal</button>
      </form>

      <div className="goals-list">
        <h2>Your Goals</h2>
        {goals.map((goal) => (
          <div className="goal-card" key={goal.id}>
            <div className="goal-card-header">
              <span className="goal-type">
                {GOAL_TYPE_LABELS[goal.goal_type] || goal.goal_type}
              </span>
              <button type="button" className="btn-danger" onClick={() => handleDeleteClick(goal.id)}>
                Delete
              </button>
            </div>
            <div className="goal-progress">
              {goal.current_value} / {goal.target_value} (
              {Math.round(goal.progress_percentage)}%)
            </div>
            {goal.goal_type === 'target_weight' && (
              <div className="goal-note">
                Not automatically tracked yet — update manually.
              </div>
            )}
            <div className="goal-date">Target date: {goal.target_date}</div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Delete this goal?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default GoalsPage
