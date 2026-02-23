import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StorageService from '../services/StorageService';

function Dashboard() {
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [cardioCount, setCardioCount] = useState(0);
  const [latestPhoto, setLatestPhoto] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    totalWeight: 0,
    totalCardioMinutes: 0,
  });

  useEffect(() => {
    const allWorkouts = StorageService.getAllWorkouts();
    if (allWorkouts.length === 0) {
      setHasData(false);
      return;
    }

    setHasData(true);

    allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = allWorkouts[0];
    setLastWorkout(recent);

    const recentExercises = StorageService.getExercisesByWorkoutId(recent.id);
    const recentCardio = StorageService.getCardioByWorkoutId(recent.id);
    setExerciseCount(recentExercises.length);
    setCardioCount(recentCardio.length);

    const allPhotos = StorageService.getAllPhotos();
    if (allPhotos.length > 0) {
      allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLatestPhoto(allPhotos[0]);
    }

    let totalReps = 0;
    let totalWeight = 0;

    allWorkouts.forEach((workout) => {
      const exercises = StorageService.getExercisesByWorkoutId(workout.id);
      exercises.forEach((exercise) => {
        const sets = StorageService.getSetsByExerciseId(exercise.id);
        sets.forEach((set) => {
          totalReps += Number(set.reps) || 0;
          totalWeight += (Number(set.weight) || 0) * (Number(set.reps) || 0);
        });
      });
    });

    const allCardio = StorageService.getAllCardio();
    const totalCardioMinutes = allCardio.reduce((sum, entry) => {
      const mins = parseInt(entry.duration, 10);
      return sum + (isNaN(mins) ? 0 : mins);
    }, 0);

    setStats({
      totalWorkouts: allWorkouts.length,
      totalReps,
      totalWeight,
      totalCardioMinutes,
    });
  }, []);

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
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2 className="dashboard-greeting">So what are we doing today?</h2>
        <button
          className="btn-save-workout dashboard-log-btn"
          onClick={() => navigate('/log')}
        >
          + Log Workout
        </button>
      </div>

      {!hasData ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty-title">Nothing logged yet.</p>
          <p className="dashboard-empty-sub">
            Head to <strong>Log Workout</strong> to record your first session
            and start tracking your progress.
          </p>
        </div>
      ) : (
        <>
          <div className="dashboard-top-row">
            <div className="dashboard-last-workout">
              <h3>Last Workout</h3>
              <p className="dashboard-workout-name">{lastWorkout.name}</p>
              <p className="dashboard-workout-date">
                {formatDate(lastWorkout.date)}
              </p>
              <p className="dashboard-workout-summary">
                {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                {cardioCount > 0 &&
                  `, ${cardioCount} cardio entr${cardioCount !== 1 ? 'ies' : 'y'}`}
              </p>
              {lastWorkout.notes && (
                <p className="dashboard-workout-notes">{lastWorkout.notes}</p>
              )}
              <button
                className="btn-edit dashboard-view-btn"
                onClick={() => navigate('/history')}
              >
                View History
              </button>
            </div>

            {latestPhoto ? (
              <div
                className="dashboard-latest-photo"
                onClick={() => navigate('/photos')}
              >
                <h3>Latest Photo</h3>
                <img
                  src={latestPhoto.image}
                  alt="Latest progress"
                  className="dashboard-photo-img"
                />
                <p className="dashboard-photo-date">
                  {formatDate(latestPhoto.date)}
                </p>
                {latestPhoto.tags && (
                  <p className="dashboard-photo-tags">{latestPhoto.tags}</p>
                )}
              </div>
            ) : (
              <div
                className="dashboard-no-photo"
                onClick={() => navigate('/photos')}
              >
                <span className="dashboard-no-photo-icon">
                  <i className="fa-solid fa-camera"></i>
                </span>
                <p>No Photos yet</p>
                <p className="dashboard-no-photo-cta">Click to add one</p>
              </div>
            )}
          </div>

          <div className="dashboard-stats-row">
            <div className="dashboard-stat-tile">
              <span className="stat-value"> {stats.totalWorkouts}</span>
              <span className="stat-label">Workout Logged</span>
            </div>
            <div className="dashboard-stat-tile">
              <span className="stat-value">
                {stats.totalReps.toLocaleString()}
              </span>
              <span className="stat-label">Total Reps</span>
            </div>
            <div className="dashboard-stat-tile">
              <span className="stat-value">
                {stats.totalWeight.toLocaleString()}
              </span>
              <span className="stat-label">Total Weight Lifted</span>
            </div>
            <div className="dashboard-stat-tile">
              <span className="stat-value">
                {stats.totalCardioMinutes.toLocaleString()}
              </span>
              <span className="stat-label">Cardio Minutes</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
