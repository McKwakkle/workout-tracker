import { useState } from 'react';
import ExerciseBlock from '../components/ExerciseBlock';
import StorageService from '../services/StorageService';

function LogWorkout() {
  const today = new Date().toISOString().split('T')[0];

  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([
    {
      name: '',
      sets: [{ set_number: 1, reps: '', weight: '', unit: 'kg' }],
    },
  ]);
  const [saveMessage, setSaveMessage] = useState('');

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: [{ set_number: 1, reps: '', weight: '', unit: 'kg' }],
      },
    ]);
  };

  const updateExercise = (index, updatedExercise) => {
    const updatedExercises = exercises.map((ex, i) => {
      if (i === index) {
        return updatedExercise;
      }
      return ex;
    });
    setExercises(updatedExercises);
  };

  const removeExercise = (index) => {
    if (exercises.length === 1) return; // Keep at least one
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      setSaveMessage('Please enter a workout name');
      return;
    }

    const savedWorkout = StorageService.saveWorkout({
      date: workoutDate,
      name: workoutName,
      notes: notes,
    });

    exercises.forEach((exercise) => {
      if (exercise.name.trim()) {
        const savedExercise = StorageService.saveExercise({
          workout_id: savedWorkout.id,
          name: exercise.name,
        });

        exercise.sets.forEach((set) => {
          if (set.weight || set.reps) {
            StorageService.saveSet({
              exercise_id: savedExercise.id,
              set_number: set.set_number,
              reps: Number(set.reps) || 0,
              weight: Number(set.weight) || 0,
              unit: set.unit,
            });
          }
        });
      }
    });

    setSaveMessage('Workout saved successfully!');
    setWorkoutName('');
    setNotes('');
    setExercises([
      {
        name: '',
        sets: [{ set_number: 1, reps: '', weight: '', unit: 'kg' }],
      },
    ]);

    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="log-workout">
      <h2>Log Workout</h2>

      <div className="workout-info">
        <div className="form-group">
          <label>Workout Name</label>
          <input
            type="text"
            placeholder="e.g. Shoulders + Triceps"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            placeholder="How did the session feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="exercises-section">
        <h3>Exercises</h3>
        {exercises.map((exercise, index) => (
          <ExerciseBlock
            key={index}
            exercise={exercise}
            onUpdate={(updated) => updateExercise(index, updated)}
            onRemove={() => removeExercise(index)}
          />
        ))}
        <button className="btn-add-exercise" onClick={addExercise}>
          + Add Exercise
        </button>
      </div>

      <button className="btn-save-workout" onClick={saveWorkout}>
        Save Workout
      </button>

      {saveMessage && (
        <p
          className={
            saveMessage.includes('success') ? 'success-msg' : 'error-msg'
          }
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}

export default LogWorkout;