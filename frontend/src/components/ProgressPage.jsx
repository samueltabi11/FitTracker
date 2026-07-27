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

// TODO: replace with useState + useEffect/fetch() to GET /api/progress/weight-progression/<exercise_id>/ once auth is wired up
const mockWeightProgression = [
  { date: '2026-07-01', weight_kg: 15 },
  { date: '2026-07-08', weight_kg: 17.5 },
  { date: '2026-07-15', weight_kg: 20 },
  { date: '2026-07-22', weight_kg: 20 }
]

// TODO: replace with useState + useEffect/fetch() to GET /api/progress/frequency/ once auth is wired up
const mockFrequency = [
  { week_start: '2026-07-20', workout_count: 3 },
  { week_start: '2026-07-13', workout_count: 2 }
]

// TODO: replace with useState + useEffect/fetch() to GET /api/progress/records/ once auth is wired up
const mockRecords = [
  { exercise_name: 'Dumbbell Shoulder Press', max_weight: 20, date: '2026-07-22' },
  { exercise_name: 'Bench Press', max_weight: 45, date: '2026-07-20' }
]

// TODO: replace with useState + useEffect/fetch() to GET /api/progress/comparison/ once auth is wired up
const mockComparison = [
  { period: 'current', workouts: 3, steps: 17600, calories: 970 },
  { period: 'previous', workouts: 2, steps: 12000, calories: 700 }
]

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
  return (
    <div className="progress">
      {/* required by Requirements Doc 2.6: weight progression per exercise */}
      <div className="progress-section">
        <h2>Weight Progression</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={mockWeightProgression}>
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
              dataKey="weight_kg"
              name="Weight (kg)"
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
          <BarChart data={mockFrequency}>
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
              <th>Max Weight (kg)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {mockRecords.map((record) => (
              <tr key={record.exercise_name}>
                <td>{record.exercise_name}</td>
                <td>{record.max_weight}</td>
                <td>{formatDate(record.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* not part of Requirements Doc 2.6, kept separate below the required charts/table */}
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
              {mockComparison.map((row) => (
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
