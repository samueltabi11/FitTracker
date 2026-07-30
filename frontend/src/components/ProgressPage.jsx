import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { isAuthenticated, authFetch } from '../auth'
import { kgToLbs } from '../utils/units'

const PROGRESS_URL = 'http://localhost:8000/api/progress/'

// TODO: replace with useState + useEffect/fetch() to GET /api/progress/weight-progression/<exercise_id>/, filtered by the selected exercise, once that endpoint exists
const mockWeightProgressionByExercise = {
  'Dumbbell Shoulder Press': [
    { date: '2026-07-01', weight_kg: 15 },
    { date: '2026-07-08', weight_kg: 17.5 },
    { date: '2026-07-15', weight_kg: 20 }
  ],
  'Bench Press': [
    { date: '2026-07-01', weight_kg: 30 },
    { date: '2026-07-10', weight_kg: 35 },
    { date: '2026-07-20', weight_kg: 45 }
  ]
}

const STRENGTH_EXERCISES = Object.keys(mockWeightProgressionByExercise)

// ISO dates only ever carry month/day/year here, so no year needed in the display (e.g. "2026-07-22" -> "Jul 22").
// timeZone: 'UTC' keeps date-only strings from shifting a day when the browser's local zone is negative UTC.
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: 4
  },
  labelStyle: { color: 'var(--text-h)' },
  itemStyle: { color: 'var(--text-h)' },
  labelFormatter: formatDate
}

function ProgressPage() {
  const [selectedExercise, setSelectedExercise] = useState(STRENGTH_EXERCISES[0])
  // Backend data is always kg; convert to lbs here for display only.
  const weightProgression = mockWeightProgressionByExercise[selectedExercise].map(
    (point) => ({ ...point, weight_lbs: kgToLbs(point.weight_kg) })
  )

  const [frequency, setFrequency] = useState([])
  const [records, setRecords] = useState([])
  const [comparison, setComparison] = useState([])
  const [error, setError] = useState('')

  const fetchFrequency = async () => {
    try {
      const response = await authFetch(`${PROGRESS_URL}workout-frequency/`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || JSON.stringify(data) || 'Could not load workout frequency')
        return
      }

      setFrequency(await response.json())
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await authFetch(`${PROGRESS_URL}personal-records/`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || JSON.stringify(data) || 'Could not load personal records')
        return
      }

      setRecords(await response.json())
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  const fetchComparison = async () => {
    try {
      const response = await authFetch(`${PROGRESS_URL}comparison/?period=week`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || JSON.stringify(data) || 'Could not load comparison')
        return
      }

      setComparison(await response.json())
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  // guests have no real token to authenticate with, so skip the fetches and just show empty sections
  useEffect(() => {
    if (isAuthenticated()) {
      fetchFrequency()
      fetchRecords()
      fetchComparison()
    }
  }, [])

  return (
    <div className="progress">
      {error && <p className="form-error">{error}</p>}

      {/* required by Requirements Doc 2.6: weight progression per exercise (strength only) */}
      <div className="progress-section">
        <h2>Weight Progression</h2>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {STRENGTH_EXERCISES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weightProgression}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: 'var(--text)', fontSize: 13 }}
            />
            <YAxis tick={{ fill: 'var(--text)', fontSize: 13 }} />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey="weight_lbs"
              name="Weight (lbs)"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: 'var(--accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* required by Requirements Doc 2.6: session frequency */}
      <div className="progress-section">
        <h2>Workout Frequency</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={frequency}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="week_start"
              tickFormatter={formatDate}
              tick={{ fill: 'var(--text)', fontSize: 13 }}
            />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text)', fontSize: 13 }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="workout_count" name="Workouts" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="progress-section">
        <h2>Personal Records</h2>
        <table>
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Max Weight (lbs)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.exercise_name}>
                <td>{record.exercise_name}</td>
                <td>{kgToLbs(record.max_weight)}</td>
                <td>{formatDate(record.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weekly comparison summary */}
      <div className="progress-extra">
        <div className="progress-section">
          <h2>This Week vs Last Week</h2>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Workouts</th>
                <th>Steps</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.period}>
                  <td className="progress-period">{row.period}</td>
                  <td>{row.workouts}</td>
                  <td>{row.steps}</td>
                  <td>{row.calories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
