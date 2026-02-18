import {useState, eseEffect, useEffect} from 'react';
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
  const [selectedExcercises, setSelectedExercises] = ([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
  earliestDate.setMonth(earliestDate.getMonth() -1);
  earliestDate.setDate(1);
  earliestDate.setHours(0, 0, 0, 0);

  const goToPrevMonth = () => {
    setSelectedDate(null);
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() -1);
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
      cells.push({type: 'empty', key: `empty-${i}`});
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      cells.push ({
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
      selectedExcercises([]);
      setSelectedPhoto(null);
      return;
    }

    setSelectedDate(cell.dateStr);

    if (cell.hasWorkout) {
      const workout = workoutsByDate[cell.dateStr];
      const exercises = StorageService.getExercisesByWorkoutId(workout.id);
      const exercisesWithSets = exercises.map((ex) => ({
        ...ex,
        sets: StorageService.getExercisesByWorkoutId(ex.id),
      }));
      setSelectedWorkout(workout);
      setSelectedExercises(exercisesWithSets);
      setSelectedPhoto(photosByDate[cell.dateStr] || null);
    } else {
      navigate('/log', {state: {prefillDate: cell.dateStr}});
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
      year: 'numberic',
    });
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cells = buildCalendarDays();

  return (
    
  )

}

export default Calendar;