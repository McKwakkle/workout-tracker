import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StorageService from '../services/StorageService';

function Calendar() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [workoutsByDate, setWorkoutsByDate] = useState({});
  const [photosByDate, setPhotosByDate] = useState({});

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedExcercises, setSelectedExercises] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCardio, setSelectedCardio] = useState([]);

  useEffect(() => {
    const allWorkouts = StorageService.getAllWorkouts();
    const allPhotos = StorageService.getAllPhotos();

    const wMap = {};
    allWorkouts.forEach((w) => {
      wMap[w.date] = w;
    });

    const pMap = {};
    allPhotos.forEach((p) => {
      pMap[p.date] = p;
    });

    setWorkoutsByDate(wMap);
    setPhotosByDate(pMap);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For local dev this is one month ago.
  // Will look to change it if I move to firebase

  const earliestDate = new Date();
  earliestDate.setMonth(earliestDate.getMonth() - 1);
  earliestDate.setDate(1);
  earliestDate.setHours(0, 0, 0, 0);

  const goToPrevMonth = () => {
    setSelectedDate(null);
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setSelectedDate(null);
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const canGoPrev =
    viewDate.getFullYear() > earliestDate.getFullYear() ||
    viewDate.getMonth() > earliestDate.getMonth();

  const canGoNext =
    viewDate.getFullYear() < today.getFullYear() ||
    viewDate.getMonth() < today.getMonth();

  const buildCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // (getDay() + 6) % 7 shifts Sunday from 0 to 6 so Monday = 0
    // I am too old to make a 6 - 7 joke
    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

    const cells = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      cells.push({
        type: 'day',
        key: dateStr,
        day,
        dateStr,
        isToday: cellDate.getTime() === today.getTime(),
        isFuture: cellDate > today,
        hasWorkout: !!workoutsByDate[dateStr],
        hasPhoto: !!photosByDate[dateStr],
      });
    }

    return cells;
  };

  const handleDayClick = (cell) => {
    if (cell.isFuture) return;

    if (selectedDate === cell.dateStr) {
      setSelectedDate(null);
      setSelectedWorkout(null);
      setSelectedExercises([]);
      setSelectedCardio([]);
      setSelectedPhoto(null);
      return;
    }

    setSelectedDate(cell.dateStr);

    if (cell.hasWorkout) {
      const workout = workoutsByDate[cell.dateStr];
      const exercises = StorageService.getExercisesByWorkoutId(workout.id);
      const exercisesWithSets = exercises.map((ex) => ({
        ...ex,
        sets: StorageService.getSetsByExerciseId(ex.id),
      }));

      const cardio = StorageService.getCardioByWorkoutId(workout.id);

      setSelectedWorkout(workout);
      setSelectedExercises(exercisesWithSets);
      setSelectedCardio(cardio);
      setSelectedPhoto(photosByDate[cell.dateStr] || null);
    } else {
      navigate('/log', { state: { prefillDate: cell.dateStr } });
    }
  };

  const monthName = viewDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const formatDetailDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cells = buildCalendarDays();

  return (
    <div className="calendar-page">
      {/*Navigation header*/}
      <div className="calendar-header">
        <button
          className="cal-nav-btn"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
        >
          ‹
        </button>
        <h2 className="cal-month-title">{monthName}</h2>
        <button
          className="cal-nav-btn"
          onClick={goToNextMonth}
          disabled={!canGoNext}
        >
          ›
        </button>
      </div>

      {/* Calendar grid*/}
      <div className="calendar-grid-wrapper">
        {/* Day of week header*/}
        <div className="calendar-day-labels">
          {dayLabels.map((label) => (
            <div className="cal-day-label" key={label}>
              {label}
            </div>
          ))}
        </div>

        {/*Day cells*/}
        <div className="calendar-grid">
          {cells.map((cell) => {
            if (cell.type === 'empty') {
              return <div className="cal-cell empty" key={cell.key} />;
            }

            return (
              <div
                key={cell.key}
                className={[
                  'cal-cell',
                  cell.isToday ? 'today' : '',
                  cell.isFuture ? 'future' : '',
                  cell.hasWorkout ? 'has-workout' : '',
                  selectedDate === cell.dateStr ? 'selected' : '',
                ]
                  .join(' ')
                  .trim()}
                onClick={() => handleDayClick(cell)}
              >
                <span className="cal-day-number">{cell.day}</span>

                {/* Dot indicator if workout was logged*/}
                {cell.hasWorkout && <span className="cal-workout-dot" />}

                {/* Camera icon if photo exists, will use a fontawesome one later*/}
                {cell.hasPhoto && <span className="cal-photo-icon">📷</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selectedDate && selectedWorkout && (
        <div className="cal-detail-panel">
          <div className="cal-detail-header">
            <h3>{selectedWorkout.name}</h3>
            <span className="cal-detail-date">
              {formatDetailDate(selectedDate)}
            </span>
          </div>

          {selectedWorkout.notes && (
            <p className="cal-detail-notes">{selectedWorkout.notes}</p>
          )}

          {/*Photo left, exercise right*/}
          <div className="cal-detail-body">
            {/* Load photo if it exists*/}
            <div className="cal-detail-photo-col">
              {selectedPhoto ? (
                <>
                  <img
                    src={selectedPhoto.image}
                    alt="Progress"
                    className="cal-detail-photo"
                  />
                  {selectedPhoto.tags && (
                    <p className="cal-detail-photo-tags">
                      {selectedPhoto.tags}
                    </p>
                  )}
                </>
              ) : (
                <div
                  className="cal-detail-no-photo"
                  onClick={() => navigate('/photos')}
                >
                  <span className="cal-no-photo-icon">📷</span>
                  <p>No photo for this day</p>
                  <p className="cal-no-photo-cta">Click to add one</p>
                </div>
              )}
            </div>

            {/*Right side*/}
            <div className="cal-detail-exercises-col">
              {selectedExcercises.length === 0 ? (
                <p className="cal-no-exercises">No exercises recorded</p>
              ) : (
                selectedExcercises.map((exercise) => (
                  <div className="cal-exercise" key={exercise.id}>
                    <h4 className="cal-exercise-name">{exercise.name}</h4>
                    {exercise.sets.map((set) => (
                      <div className="cal-set-row" key={set.id}>
                        <span className="cal-set-number">
                          Set {set.set_number}
                        </span>
                        <span className="cal-set-info">
                          {set.weight}
                          {set.unit} x {set.reps} reps
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/*Cardio entires*/}
            {selectedCardio.length > 0 && (
              <div className="cal-cardio-detail">
                <h4 className="cal-cardio-title">Cardio</h4>
                {selectedCardio.map((entry) => (
                  <div className="cal-cardio-entry" key={entry.id}>
                    <span className="cal-cardio-activity">
                      {entry.activity}
                    </span>
                    <div className="cal-cardio-stats">
                      {entry.duration && <span>{entry.duration} mins</span>}
                      {entry.distance && <span>{entry.distance} km</span>}
                      {entry.intensity && (
                        <span>Intensity: {entry.intensity}/20</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
