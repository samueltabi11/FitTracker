import { useState } from 'react'

const CARDIO_EXERCISES = [
  'Running',
  'Cycling',
  'Rowing',
  'Swimming',
  'Jump Rope',
  'Elliptical',
  'Walking'
]

const OTHER_EXERCISE = 'other'

// cardio's own form since it's a separate table on the backend (no sets/reps/weight here, that's strength only)
function LogCardioForm() {
  const [workoutName, setWorkoutName] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  const [exerciseSelection, setExerciseSelection] = useState(CARDIO_EXERCISES[0])
  const [customExerciseName, setCustomExerciseName] = useState('')
  const exerciseName =
    exerciseSelection === OTHER_EXERCISE ? customExerciseName : exerciseSelection

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
        <select
          value={exerciseSelection}
          onChange={(e) => setExerciseSelection(e.target.value)}
          required
        >
          {CARDIO_EXERCISES.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
          <option value={OTHER_EXERCISE}>Other (type your own)</option>
        </select>
        {exerciseSelection === OTHER_EXERCISE && (
          <input
            type="text"
            placeholder="Enter exercise name"
            value={customExerciseName}
            onChange={(e) => setCustomExerciseName(e.target.value)}
            required
          />
        )}
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
