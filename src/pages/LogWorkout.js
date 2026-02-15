import {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
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
      sets: [{set_number: 1, reps: '', weight: '', unit: 'kg'}],
    },
  ]);
  const [saveMessage, setSaveMessage] = useState('');

  // Checking to see if you are editing an existing workout
  useEffect(() => {
    if (location.state?.editMode) {
      const {workout, exercises: existingExercises} = location.state;
      setEditMode(true);
      setWorkoutId(workout.id);
      setWorkoutName(workout.name);
      setWorkoutDate(workout.date);
      setNotes(workout.notes || '');

      const formattedExercises = existingExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.length > 0
        ? exercise.sets.map((set) => ({
          id: set.id,
          set_number: set.set_number,
          reps: set.reps,
          weight: set.weight,
          unit: set.unit,
        }))
        : [{set_number: 1, reps: '', weight: '', unit: 'kg'}],
      }));

      setExercises(formattedExercises);
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
        sets: [{set_number: 1, reps: '', weight: '', unit: 'kg'}],
      },
    ]);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: [{set_number: 1, reps: '', weight: '', unit: 'kg'}],
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
    if  (exercises.length === 1) {return;
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

      