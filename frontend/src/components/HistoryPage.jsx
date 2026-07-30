import { useState } from 'react'

// TODO: replace with useState + useEffect/fetch() to GET /api/workouts/ once auth is wired up
const mockWorkouts = [
  { id: 1, name: 'Upper Body Day', date: '2026-07-22', duration_minutes: 60, exercise_count: 3 },
  { id: 2, name: 'Leg Day', date: '2026-07-20', duration_minutes: 45, exercise_count: 4 },
  { id: 3, name: 'Morning Run', date: '2026-07-19', duration_minutes: 30, exercise_count: 1 }
]

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function HistoryPage() {
  const [workouts] = useState(mockWorkouts)
  const [search, setSearch] = useState('')

  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id) => {
    console.log('Delete workout:', id)
    // API call goes here once auth/login is sorted, just logging for now so we can see the shape
  }

  return (
    <div className="history">
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
