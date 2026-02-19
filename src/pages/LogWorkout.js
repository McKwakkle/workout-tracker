import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExerciseBlock from '../components/ExerciseBlock';
import StorageService from '../services/StorageService';

function LogWorkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [editMode, setEditMode] = useState(false);
  const [workoutId, setWorkoutId] = useState(null);
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

  // Checking to see if you are editing an existing workout
  useEffect(() => {
    if (location.state?.editMode) {
      const { workout, exercises: existingExercises } = location.state;
      setEditMode(true);
      setWorkoutId(workout.id);
      setWorkoutName(workout.name);
      setWorkoutDate(workout.date);
      setNotes(workout.notes || '');

      const formattedExercises = existingExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets:
          exercise.sets.length > 0
            ? exercise.sets.map((set) => ({
                id: set.id,
                set_number: set.set_number,
                reps: set.reps,
                weight: set.weight,
                unit: set.unit,
              }))
            : [{ set_number: 1, reps: '', weight: '', unit: 'kg' }],
      }));

      setExercises(formattedExercises);
    }

    if (location.state?.prefillDate) {
      setWorkoutDate(location.state.prefillDate);
    }
  }, [location.state]);

  // Reset form
  const resetForm = () => {
    setEditMode(false);
    setWorkoutId(null);
    setWorkoutName('');
    setWorkoutDate(today);
    setNotes('');
    setExercises([
      {
        name: '',
        sets: [{ set_number: 1, reps: '', weight: '', unit: 'kg' }],
      },
    ]);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: [{ set_number: 1, reps: '', weight: '', unit: 'kg' }],
      },
    ]);
  };

  // Update exercise at a specific index
  const updateExercise = (index, updatedExercise) => {
    const updatedExercises = exercises.map((ex, i) => {
      if (i === index) {
        return updatedExercise;
      }
      return ex;
    });
    setExercises(updatedExercises);
  };

  // Remove exercise
  const removeExercise = (index) => {
    if (exercises.length === 1) return;
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  // Save workout
  const saveWorkout = () => {
    if (!workoutName.trim()) {
      setSaveMessage('Please enter a workout name.');
      return;
    }

    if (editMode) {
      StorageService.saveWorkout({
        id: workoutId,
        date: workoutDate,
        name: workoutName,
        notes: notes,
      });

      StorageService.deleteExercisesByWorkoutId(workoutId);

      exercises.forEach((exercise) => {
        if (exercise.name.trim()) {
          const saveExercise = StorageService.saveExercise({
            workout_id: workoutId,
            name: exercise.name,
          });

          exercise.sets.forEach((set) => {
            if (set.weight || set.reps) {
              StorageService.saveSet({
                exercise_id: saveExercise.id,
                set_number: set.set_number,
                reps: Number(set.reps) || 0,
                weight: Number(set.weight) || 0,
                unit: set.unit,
              });
            }
          });
        }
      });

      setSaveMessage('Workout saved successfully');
      setTimeout(() => {
        navigate('/history');
      }, 1500);
    } else {
      //Create new workout
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

      setSaveMessage('Workout saved successfully');
      resetForm();
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="log-workout">
      <h2>{editMode ? 'Edit Workout' : 'Log Workout'}</h2>

      <div className="workout-info">
        <div className="form-group">
          <label>Workout Name</label>
          <input
            type="text"
            placeholder="e.g. Shoulders + triceps"
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
          <label>Notes (Optional)</label>
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
        {editMode ? 'Update Workout' : 'Save Workout'}
      </button>

      {editMode && (
        <button
          className="btn-cancel-edit"
          onClick={() => navigate('/history')}
        >
          Cancel
        </button>
      )}

      {saveMessage && (
        <p
          className={
            saveMessage.includes('success') || saveMessage.includes('updated')
              ? 'success-msg'
              : 'error-msg'
          }
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}

export default LogWorkout;
