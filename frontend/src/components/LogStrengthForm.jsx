import { useState } from 'react'

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

// strength's own form since it's a separate table on the backend (sets/reps/weight live here, cardio doesn't have these)
function LogStrengthForm() {
  const [workoutName, setWorkoutName] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  const [exerciseSelection, setExerciseSelection] = useState(STRENGTH_EXERCISES[0])
  const [customExerciseName, setCustomExerciseName] = useState('')
  const exerciseName =
    exerciseSelection === OTHER_EXERCISE ? customExerciseName : exerciseSelection

  const [sets, setSets] = useState([
    { set_number: 1, reps: '', weight_kg: '', is_completed: false }
  ])

  // just tacks on another blank set, numbering is based on however many are already there
  const addSet = () => {
    setSets([
      ...sets,
      { set_number: sets.length + 1, reps: '', weight_kg: '', is_completed: false }
    ])
  }

  const updateSet = (index, field, value) => {
    const updatedSets = [...sets]
    updatedSets[index][field] = value
    setSets(updatedSets)
  }

  // drops the set and renumbers the rest so set_number stays sequential
  const removeSet = (index) => {
    const updatedSets = sets
      .filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, set_number: i + 1 }))
    setSets(updatedSets)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const workoutData = {
      name: workoutName,
      workout_type: 'strength',
      date: date,
      duration_minutes: parseInt(duration),
      notes: notes,
      exercises: [
        {
          exercise: exerciseName,
          order: 0,
          sets: sets.map((set) => ({
            set_number: set.set_number,
            reps: parseInt(set.reps),
            weight_kg: parseFloat(set.weight_kg),
            is_completed: set.is_completed
          }))
        }
      ]
    }

    console.log('Workout data ready to send:', workoutData)
    // API call goes here once auth/login is sorted, just logging for now so we can see the shape
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Strength Workout</h2>

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
            placeholder="Weight (kg)"
            value={set.weight_kg}
            onChange={(e) => updateSet(index, 'weight_kg', e.target.value)}
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