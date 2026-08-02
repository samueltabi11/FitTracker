import { useState } from 'react'
import { API_BASE_URL, isAuthenticated, authFetch } from '../auth'
import { lbsToKg } from '../utils/units'
import { extractErrorMessage } from '../utils/errors'
import { todayDate } from '../utils/dates'

const WORKOUTS_URL = `${API_BASE_URL}/api/workouts/`
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

// Strength workouts get their own form because they're stored as a separate table on
// the backend: sets, reps, and weight live here, whereas cardio workouts don't have them.
function LogStrengthForm() {
  const [workoutName, setWorkoutName] = useState('')
  const [date, setDate] = useState(todayDate())
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  const [exerciseSelection, setExerciseSelection] = useState(STRENGTH_EXERCISES[0])
  const [customExerciseName, setCustomExerciseName] = useState('')
  const exerciseName =
    exerciseSelection === OTHER_EXERCISE ? customExerciseName : exerciseSelection

  // weight_lbs holds what the user types (display unit); it's converted to weight_kg
  // only when building the payload sent to the backend.
  const [sets, setSets] = useState([
    { set_number: 1, reps: '', weight_lbs: '', is_completed: false }
  ])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Appends a new blank set, numbering it based on how many sets already exist.
  const addSet = () => {
    setSets([
      ...sets,
      { set_number: sets.length + 1, reps: '', weight_lbs: '', is_completed: false }
    ])
  }

  const updateSet = (index, field, value) => {
    const updatedSets = [...sets]
    updatedSets[index][field] = value
    setSets(updatedSets)
  }

  // Removes the set and renumbers the remaining sets so set_number stays sequential.
  const removeSet = (index) => {
    const updatedSets = sets
      .filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, set_number: i + 1 }))
    setSets(updatedSets)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      setError('Sign in to log workouts')
      return
    }
    setError('')
    setSuccess('')

    try {
      const exerciseId = await resolveExerciseId(exerciseName, 'strength')

      const workoutData = {
        name: workoutName,
        workout_type: 'strength',
        date: date,
        duration_minutes: parseInt(duration),
        notes: notes,
        exercises: [
          {
            exercise: exerciseId,
            order: 0,
            sets: sets.map((set) => ({
              set_number: set.set_number,
              reps: parseInt(set.reps),
              weight_kg: lbsToKg(parseFloat(set.weight_lbs)),
              is_completed: set.is_completed
            }))
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
        setError(extractErrorMessage(data, 'Could not save workout, please check the form and try again'))
        return
      }

      setSuccess('Workout saved!')
      setWorkoutName('')
      setDate(todayDate())
      setDuration('')
      setNotes('')
      setExerciseSelection(STRENGTH_EXERCISES[0])
      setCustomExerciseName('')
      setSets([{ set_number: 1, reps: '', weight_lbs: '', is_completed: false }])
    } catch {
      setError('Could not reach the server, please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Strength Workout</h2>

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
          max={todayDate()}
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
          {STRENGTH_EXERCISES.map((exercise) => (
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

      <h3>Sets</h3>
      {sets.map((set, index) => (
        <div key={index}>
          <span>Set {set.set_number}</span>
          <input
            type="number"
            placeholder="Reps"
            value={set.reps}
            onChange={(e) => updateSet(index, 'reps', e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Weight (lbs)"
            value={set.weight_lbs}
            onChange={(e) => updateSet(index, 'weight_lbs', e.target.value)}
            required
          />
          {sets.length > 1 && (
            <button type="button" onClick={() => removeSet(index)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addSet}>
        Add Set
      </button>

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

export default LogStrengthForm