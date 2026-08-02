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
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'
import { kgToLbs } from '../utils/units'
import { extractErrorMessage } from '../utils/errors'

const PROGRESS_URL = `${API_BASE_URL}/api/progress/`
const EXERCISES_URL = `${API_BASE_URL}/api/exercises/`

const STRENGTH_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Dumbbell Shoulder Press',
  'Bicep Curl',
  'Lat Pulldown',
  'Leg Press'
]

// Looks up an exercise's id by name/category. Unlike LogStrengthForm's version, this
// never creates the exercise - if it doesn't exist yet, there's no progression data for
// it either, so callers should just treat a null return as "no data".
async function resolveExerciseId(name, category) {
  const searchResponse = await authFetch(
    `${EXERCISES_URL}?search=${encodeURIComponent(name)}&category=${category}`
  )

  if (!searchResponse.ok) {
    return null
  }

  const results = await searchResponse.json()
  const match = results.find(
    (exercise) => exercise.name.toLowerCase() === name.toLowerCase()
  )
  return match ? match.id : null
}

// ISO dates only ever carry month/day/year here, so no year needed in the display (e.g. "2026-07-22" -> "Jul 22").
// timeZone: 'UTC' keeps date-only strings from shifting a day when the browser's local zone is negative UTC.
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

// Frequency bars are bucketed by week (see WorkoutFrequencyView's TruncWeek), so the
// x-axis needs "Week of" to make clear each bar isn't a single day's workout.
function formatWeekLabel(isoDate) {
  return `Week of ${formatDate(isoDate)}`
}

// Pads the line's actual min/max by 10% so its variation is visible instead of
// compressed against a 0-based scale. Falls back to a flat +/-10% (or +/-10 when the
// value is 0) if every point is identical, since a zero-width range can't be padded by
// a percentage of itself.
function weightAxisDomain([dataMin, dataMax]) {
  const padding = dataMin === dataMax
    ? (dataMin === 0 ? 10 : Math.abs(dataMin) * 0.1)
    : (dataMax - dataMin) * 0.1
  return [dataMin - padding, dataMax + padding]
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
  const [weightProgressionRaw, setWeightProgressionRaw] = useState([])
  // Backend data is always kg; convert to lbs here for display only.
  const weightProgression = weightProgressionRaw.map((point) => ({
    ...point,
    weight_lbs: kgToLbs(point.weight_kg)
  }))

  const [frequency, setFrequency] = useState([])
  const [records, setRecords] = useState([])
  const [comparison, setComparison] = useState([])
  const [error, setError] = useState('')

  const fetchWeightProgression = async (exerciseName) => {
    try {
      const exerciseId = await resolveExerciseId(exerciseName, 'strength')
      if (!exerciseId) {
        setWeightProgressionRaw([])
        return
      }

      const response = await authFetch(`${PROGRESS_URL}weight-progression/${exerciseId}/`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not load weight progression'))
        return
      }

      setWeightProgressionRaw(await response.json())
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  const fetchFrequency = async () => {
    try {
      const response = await authFetch(`${PROGRESS_URL}workout-frequency/`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(extractErrorMessage(data, 'Could not load workout frequency'))
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
        setError(extractErrorMessage(data, 'Could not load personal records'))
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
        setError(extractErrorMessage(data, 'Could not load your weekly comparison'))
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

  // re-fetch whenever the selected exercise changes
  useEffect(() => {
    if (isAuthenticated()) {
      fetchWeightProgression(selectedExercise)
    }
  }, [selectedExercise])

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
            <YAxis domain={weightAxisDomain} tick={{ fill: 'var(--text)', fontSize: 13 }} />
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
              tickFormatter={formatWeekLabel}
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
