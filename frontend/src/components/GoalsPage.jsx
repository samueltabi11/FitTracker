import { useState } from 'react'

const GOAL_TYPES = [
  { value: 'daily_steps', label: 'Daily Steps' },
  { value: 'weekly_workouts', label: 'Weekly Workouts' }
]

const GOAL_TYPE_LABELS = GOAL_TYPES.reduce((acc, { value, label }) => {
  acc[value] = label
  return acc
}, {})

// matches the shape the goals API returns, used as placeholder data until the endpoint is wired up
const mockGoals = [
  {
    id: 1,
    goal_type: 'weekly_workouts',
    target_value: 4,
    current_value: 0,
    progress_percentage: 0,
    target_date: '2026-08-22',
    is_active: true,
    achieved: false
  }
]

function GoalsPage() {
  const [goalType, setGoalType] = useState(GOAL_TYPES[0].value)
  const [targetValue, setTargetValue] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const [goals, setGoals] = useState(mockGoals)

  const handleSubmit = (e) => {
    e.preventDefault()

    const goalData = {
      goal_type: goalType,
      target_value: parseFloat(targetValue),
      target_date: targetDate
    }

    console.log('Goal data ready to send:', goalData)
    // API call goes here once auth/login is sorted, just logging for now so we can see the shape
  }

  const handleDelete = (id) => {
    console.log('Delete goal:', id)
    // API call goes here once auth/login is sorted, just logging for now so we can see the shape
  }

  return (
    <div className="goals">
      <form onSubmit={handleSubmit}>
        <h2>Set a Goal</h2>

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
              <button type="button" onClick={() => handleDelete(goal.id)}>
                Delete
              </button>
            </div>
            <div className="goal-progress">
              {goal.current_value} / {goal.target_value} (
              {goal.progress_percentage}%)
            </div>
            <div className="goal-date">Target date: {goal.target_date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GoalsPage
