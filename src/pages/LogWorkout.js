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
  const [hasCardio, setHasCardio] = useState(false);
  const [cardioEntries, setCardioEntries] = useState([]);

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

      const existingCardio = StorageService.getCardioByWorkoutId(workout.id);
      if (existingCardio.length > 0) {
        setHasCardio(true);
        setCardioEntries(
          existingCardio.map((entry) => ({
            id: entry.id,
            activity: entry.activity,
            duration: entry.duration,
            distance: entry.distance,
            intensity: entry.intensity,
          })),
        );
      }
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
    setHasCardio(false);
    setCardioEntries([]);
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

  const addCardioEntry = () => {
    setCardioEntries([
      ...cardioEntries,
      { activity: '', duration: '', distance: '', intensity: '' },
    ]);
  };

  const updateCardioEntry = (index, field, value) => {
    const updated = cardioEntries.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setCardioEntries(updated);
  };

  const removeCardioEntry = (index) => {
    setCardioEntries(cardioEntries.filter((_, i) => i !== index));
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

      StorageService.deleteCardioByWorkoutId(workoutId);
      if (hasCardio) {
        cardioEntries.forEach((entry) => {
          if (entry.activity.trim()) {
            StorageService.saveCardio({
              workout_id: workoutId,
              activity: entry.activity,
              duration: entry.duration,
              distance: entry.distance,
              intensity: entry.intensity,
            });
          }
        });
      }

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

      if (hasCardio) {
        cardioEntries.forEach((entry) => {
          if (entry.activity.trim()) {
            StorageService.saveCardio({
              workout_id: savedWorkout.id,
              activity: entry.activity,
              duration: entry.duration,
              distance: entry.distance,
              intensity: entry.intensity,
            });
          }
        });
      }

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

      <div className="cardio-section">
        <label className="cardio-checkbox-label">
          <input
            type="checkbox"
            checked={hasCardio}
            onChange={(e) => {
              setHasCardio(e.target.checked);
              if (!e.target.checked) setCardioEntries([]);
            }}
          />
          Did you do cardio today?
        </label>

        {hasCardio && (
          <div className="cardio-entries">
            {cardioEntries.length === 0 && (
              <p className="cardio-empty">Click below to add a cardio entry.</p>
            )}

            {cardioEntries.map((entry, index) => (
              <div className="cardio-block" key={index}>
                <div className="cardio-block-header">
                  <input
                    type="text"
                    className="cardio-activity-input"
                    placeholder="Activity (e.g. Cycling, stair master)"
                    value={entry.activity}
                    onChange={(e) =>
                      updateCardioEntry(index, 'activity', e.target.value)
                    }
                  />
                  <button
                    className="btn-remove"
                    onClick={() => removeCardioEntry(index)}
                  >
                    x
                  </button>
                </div>

                <div className="cardio-fields">
                  <div className="cardio-field">
                    <label>Duration (mins)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={entry.duration}
                      onChange={(e) =>
                        updateCardioEntry(index, 'duration', e.target.value)
                      }
                    />
                  </div>

                  <div className="cardio-field">
                    <label>Distance (km)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={entry.distance}
                      onChange={(e) =>
                        updateCardioEntry(index, 'distance', e.target.value)
                      }
                    />
                  </div>

                  <div className="cardio-field">
                    <label>Intensity (1-20)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      placeholder="e.g. 12"
                      value={entry.intensity}
                      onChange={(e) =>
                        updateCardioEntry(index, 'intensity', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-add-cardio" onClick={addCardioEntry}>
              + Add Cardio
            </button>
          </div>
        )}
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
