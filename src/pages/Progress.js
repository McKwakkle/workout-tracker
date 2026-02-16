import { useEffect, useState } from 'react';
import StorageService from '../services/StorageService';

function Progress() {
  const [allExerciseNames, setAllExerciseNames] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [matchedPhoto, setMatchedPhoto] = useState(null);

  useEffect(() => {
    loadExerciseNames();
  }, []);

  const loadExerciseNames = () => {
    const workouts = StorageService.getAllWorkouts();
    const exerciseMap = {};
    const recentList = [];

    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    workouts.forEach((workout) => {
      const exercises = StorageService.getExercisesByWorkoutId(workout.id);
      exercises.forEach((exercise) => {
        if (!exerciseMap[exercise.name]) {
          exerciseMap[exercise.name] = true;
          // Add to recent list (6)
          if (recentList.length < 6) {
            recentList.push(exercise.name);
          }
        }
      });
    });

const sortedNames = Object.keys(exerciseMap).sort();
    setAllExerciseNames(sortedNames);
    setRecentExercises(recentList);
  };

  const selectExercise = (exerciseName) => {
    setSelectedExercise(exerciseName);

    const workouts = StorageService.getAllWorkouts();
    const data = [];

    workouts.sort((a, b) => new Date(a.date) - new Date(b.date));

    workouts.forEach((workout) => {
      const exercises = StorageService.getExercisesByWorkoutId(workout.id);
      const match = exercises.find((ex) => ex.name === exerciseName);

      if (match) {
        const sets = StorageService.getSetsByExerciseId(match.id);

        if (sets.length > 0) {
          const heaviest = sets.reduce((max, set) =>
          Number(set.weight) > Number(max.weight) ? set : max
          );

          const totalVolume = sets.reduce(
            (sum, set) => sum + Number(set.weight) * Number(set.reps),
            0
          );

          data.push({
            date: workout.date,
            WorkoutName: workout.name,
            heaviestWeight: Number(heaviest.weight),
            heaviestReps: Number(heaviest.reps),
            unit: heaviest.unit,
            totalSets: sets.length,
            totalVolume: totalVolume,
            allSets: sets,
          });
        }
      }
    });

    setProgressData(data);

    // Check for a matching photo (Closest date)
    const photos = StorageService.getAllPhotos();
    if (photos.length > 0 && data.length > 0) {
      const latestWorkoutDate = data[data.length - 1].date;
      const closest = photos.reduce((prev, curr) => {
        const prevDiff = Math.abs(
          new Date(prev.date) - new Date(latestWorkoutDate)
        );
        const currDiff = Math.abs(
          new Date(curr.date) - new Date(latestWorkoutDate)
        );
        return currDiff < prevDiff ? curr : prev;
      });
      // This only shows photos if it is within 7 days of the last workout
const daysDiff =
Math.abs(new Date(closest.date) - new Date(latestWorkoutDate)) /
(1000 * 60 * 60 * 24);
      if (daysDiff <= 7) {
        setMatchedPhoto(closest);
      } else {
        setMatchedPhoto(null);
      }
    } else {
      setMatchedPhoto(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

    const getPersonalBest = () => {
      if (progressData.length === 0) return null;
      return progressData.reduce((best, entry) =>
      entry.heaviestWeight > max.heaviestWeight ? entry : max
      );
    };

    const personalBest = selectedExercise ? getPersonalBest() : null;

    return (
    <div className="progress-page">
      <h2>Progress</h2>

// Exercise slection
        {}
        <div className="exercise-selector">
        <div className="form-group">
        <label>Select Exercise:</label>
        <select
        value={selectedExercise}
        onChange={(e) => selectExercise(e.target.value)}
        className='exercise-dropdown'
        >
        <option value="">-- Choose an Exercise --</option>
        {allExerciseNames.map((name) => (
        <option key={name} value={name}>
        {name}
        </option>
        ))}
        </select>
        </div>

        {recentExercises.length > 0 && (
        <div className="recent-exercises">
        <label>Recent Exercises</label>
        <div className="exercise-tiles">
        {recentExercises.map((name) => (
        <button
        key={name}
        className={`exercise-tile ${selectedExercise === name ? 'active' : ''}`}
        onClick={() => selectExercise(name)}
        >
        {name}
        </button>
        ))}
        </div>
        </div>
        )}
        </div>

        {/*Progress Count*/}
        {selectedExercise && (
        <div className="progress-content">
        {/*Personal Best*/}
        {personalBest && (
          <div className="personal-best-banner">
          <span className='pb-label'>Personal Best</span>
          <span className='pb-value'>
          {personalBest.heaviestWeight}
          {personalBest.unit} x {personalBest.heaviestReps} reps
          </span>
          <span className="pb-date">
          {formatDate(personalBest.date)}
          </span>
          </div>
        )}

        {/*Split layout*/}
        <div
        className={`progress-layout ${matchedPhoto ? 'has-photo' : 'no-photo'}`}
        >
        {/*Photo Section*/}
        {matchedPhoto && (
        <div className="progress-photo-section">
        <h3>Latest Photo</h3>
        {matchedPhoto.image ? (
        <img
        src={matchedPhoto.image}
        alt="Progress"
        className="progress-photo"
        />
        ) : (
          <div className="photo-placeholder">
          <p>Photo saved but preview not available</p>
          </div>
        )}
        <p className="photo-date">
        {formatDate(matchedPhoto.date)}
        </p>
        {matchedPhoto.tage && (
        <p className="photo-tags">{matchedPhoto.tags}</p>
        )}
        </div>
        )}

export default Progress;