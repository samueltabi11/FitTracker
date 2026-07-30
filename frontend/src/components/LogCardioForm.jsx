import { useState } from 'react'
import { isAuthenticated, authFetch } from '../auth'
import { milesToKm } from '../utils/units'

const WORKOUTS_URL = 'http://localhost:8000/api/workouts/'
const EXERCISES_URL = 'http://localhost:8000/api/exercises/'

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

// Exercises are stored by id on the backend (Workout -> WorkoutExercise -> Exercise FK),
// so look up an existing exercise by name/category, or create it if this is the first
// time it's been logged (covers both the preset list and a custom "other" entry).
async function resolveExerciseId(name, category) {
  const searchResponse = await authFetch(
    `${EXERCISES_URL}?search=${encodeURIComponent(name)}&category=${category}`
  )

  if (searchResponse.ok) {
    const results = await searchResponse.json()
    const match = results.find(
      (exercise) => exercise.name.toLowerCase() === name.toLowerCase()
    )
    if (match) {
      return match.id
    }
  }

  const createResponse = await authFetch(EXERCISES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category })
  })

  if (!createResponse.ok) {
    throw new Error('Could not resolve exercise')
  }

  const created = await createResponse.json()
  return created.id
}

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

  // distance is entered by the user in miles (display unit); converted to km only
  // when building the payload sent to the backend.
  const [distance, setDistance] = useState('')
  const [difficulty, setDifficulty] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      setError('Sign in to log workouts')
      return
    }
    setError('')
    setSuccess('')

    try {
      const exerciseId = await resolveExerciseId(exerciseName, 'cardio')

      // NOTE: difficulty has no backing field on the backend (WorkoutSet only has
      // set_number/reps/weight_kg/duration_seconds/distance_km/is_completed), so it
      // isn't sent here - it would just be silently dropped by the serializer.
      const workoutData = {
        name: workoutName,
        workout_type: 'cardio',
        date: date,
        duration_minutes: parseInt(duration),
        notes: notes,
        exercises: [
          {
            exercise: exerciseId,
            order: 0,
            sets: [
              {
                set_number: 1,
                distance_km: milesToKm(parseFloat(distance)),
                is_completed: false
              }
            ]
          }
        ]
      }

      const response = await authFetch(WORKOUTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || JSON.stringify(data) || 'Could not save workout')
        return
      }

      setSuccess('Workout saved!')
      setWorkoutName('')
      setDate('')
      setDuration('')
      setNotes('')
      setExerciseSelection(CARDIO_EXERCISES[0])
      setCustomExerciseName('')
      setDistance('')
      setDifficulty('')
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Cardio Workout</h2>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

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
        <label>Distance (mi)</label>
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
