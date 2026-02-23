import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StorageService from '../services/StorageService';
import ScrollToTopButton from '../components/ScrollToTopButton';

function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [workoutDetails, setWorkoutDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    const allWorkouts = StorageService.getAllWorkouts();
    allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    setWorkouts(allWorkouts);
  };

  const toggleExpand = (workoutId) => {
    if (expandedId === workoutId) {
      setExpandedId(null);
      return;
    }

    const exercises = StorageService.getExercisesByWorkoutId(workoutId);
    const exercisesWithSets = exercises.map((exercise) => ({
      ...exercise,
      sets: StorageService.getSetsByExerciseId(exercise.id),
    }));

    const cardio = StorageService.getCardioByWorkoutId(workoutId);

    setWorkoutDetails((prev) => ({
      ...prev,
      [workoutId]: {
        exercises: exercisesWithSets,
        cardio: cardio,
      },
    }));
    setExpandedId(workoutId);
  };

  const deleteWorkout = (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      StorageService.deleteWorkout(workoutId);
      loadWorkouts();
      if (expandedId === workoutId) {
        setExpandedId(null);
      }
    }
  };

  // Edit a workout - navigate to log page with workout data
  const editWorkout = (workoutId) => {
    const workout = StorageService.getWorkoutById(workoutId);
    const exercises = StorageService.getExercisesByWorkoutId(workoutId);
    const exercisesWithSets = exercises.map((exercise) => ({
      ...exercise,
      sets: StorageService.getSetsByExerciseId(exercise.id),
    }));

    navigate('/log', {
      state: {
        editMode: true,
        workout: workout,
        exercises: exercisesWithSets,
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="workout-history">
      <h2>Workout History</h2>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <p>No workouts logged yet.</p>
          <p>
            Head to <strong>Log Workout</strong> to record your first session!
          </p>
        </div>
      ) : (
        <div className="workout-list">
          {workouts.map((workout) => (
            <div className="workout-card" key={workout.id}>
              <div
                className="workout-card-header"
                onClick={() => toggleExpand(workout.id)}
              >
                <div className="workout-card-info">
                  <h3>{workout.name}</h3>
                  <span className="workout-date">
                    {formatDate(workout.date)}
                  </span>
                </div>
                <span className="expand-icon">
                  {expandedId === workout.id ? '▲' : '▼'}
                </span>
              </div>

              {workout.notes && (
                <p className="workout-notes">{workout.notes}</p>
              )}

              <div
                className={`workout-detail ${expandedId === workout.id ? 'expanded' : ''}`}
              >
                {workoutDetails[workout.id] && (
                  <>
                    {workoutDetails[workout.id].length === 0 ? (
                      <p className="no-exercises">
                        No exercises recorded for this workout.
                      </p>
                    ) : (
                      workoutDetails[workout.id].exercises.map((exercise) => (
                        <div className="exercise-detail" key={exercise.id}>
                          <h4>{exercise.name}</h4>
                          <div className="sets-detail">
                            {exercise.sets.map((set) => (
                              <div className="set-detail-row" key={set.id}>
                                <span className="set-number">
                                  Set {set.set_number}
                                </span>
                                <span className="set-info">
                                  {set.weight}
                                  {set.unit} x {set.reps} reps
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}

                    {/* added a cardio section */}
                    {workoutDetails[workout.id].cardio.length > 0 && (
                      <div className="cardio-detail">
                        <h4 className="cardio-detail-title">Cardio</h4>
                        {workoutDetails[workout.id].cardio.map((entry) => (
                          <div className="cardio-detail-entry" key={entry.id}>
                            <span className="cardio-detail-activity">
                              {entry.activity}
                            </span>
                            <div className="cardio-detail-stats">
                              {entry.duration && (
                                <span>{entry.duration} mins</span>
                              )}
                              {entry.distance && (
                                <span>{entry.distance} km</span>
                              )}
                              {entry.intensity && (
                                <span>Intensity: {entry.intensity}/20</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="workout-actions">
                      <button
                        className="btn-edit"
                        onClick={() => editWorkout(workout.id)}
                      >
                        Edit Workout
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        Delete Workout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

export default WorkoutHistory;
