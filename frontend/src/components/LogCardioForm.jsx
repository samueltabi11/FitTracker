import { useState } from 'react'

// cardio's own form since it's a separate table on the backend (no sets/reps/weight here, that's strength only)
function LogCardioForm() {
  const [workoutName, setWorkoutName] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  const [exerciseName, setExerciseName] = useState('')
  const [distance, setDistance] = useState('')
  const [difficulty, setDifficulty] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const workoutData = {
      name: workoutName,
      workout_type: 'cardio',
      date: date,
      duration_minutes: parseInt(duration),
      notes: notes,
      exercises: [
        {
          exercise: exerciseName,
          order: 0,
          distance_km: parseFloat(distance),
          difficulty: parseInt(difficulty)
        }
      ]
    }

    console.log('Workout data ready to send:', workoutData)
    // API call goes here once auth/login is sorted, just logging for now so we can see the shape
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Cardio Workout</h2>

      <div>
        <label>Workout Name</label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          required
        />
      </div>

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
        <label>Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Exercise Name</label>
        <input
          type="text"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Distance (km)</label>
        <input
          type="number"
          step="0.01"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Difficulty (1-10)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit">Save Workout</button>
    </form>
  )
}

export default LogCardioForm
