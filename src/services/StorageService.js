import { LocalStorage } from './LocalStorage';

const storage = new LocalStorage();

const StorageService = {
  getAllWorkouts: () => {
    return storage.getAll('workouts');
  },

  getWorkoutById: (id) => {
    return storage.getById('workouts', id);
  },

  saveWorkout: (workout) => {
    return storage.save('workouts', workout);
  },

  deleteWorkout: (id) => {
    const exercises = StorageService.getExercisesByWorkoutId(id);
    exercises.forEach((exercise) => {
      StorageService.deleteSetsByExerciseId(exercise.id);
    });
    StorageService.deleteExercisesByWorkoutId(id);
    StorageService.deleteCardioByWorkoutId(id);
    return storage.delete('workouts', id);
  },

  getExercisesByWorkoutId: (workoutId) => {
    const allExercises = storage.getAll('exercises');
    return allExercises.filter(
      (exercise) => exercise.workout_id === workoutId
    );
  },

  saveExercise: (exercise) => {
    return storage.save('exercises', exercise);
  },

  deleteExercise: (id) => {
    StorageService.deleteSetsByExerciseId(id);
    return storage.delete('exercises', id);
  },

  deleteExercisesByWorkoutId: (workoutId) => {
    const allExercises = storage.getAll('exercises');
    const toDelete = allExercises.filter(
      (exercise) => exercise.workout_id === workoutId
    );
    toDelete.forEach((exercise) => {
      StorageService.deleteSetsByExerciseId(exercise.id);
    });
    const toKeep = allExercises.filter(
      (exercise) => exercise.workout_id !== workoutId
    );
    storage.replaceAll('exercises', toKeep);
  },

  getSetsByExerciseId: (exerciseId) => {
    const allSets = storage.getAll('sets');
    return allSets
      .filter((set) => set.exercise_id === exerciseId)
      .sort((a, b) => a.set_number - b.set_number);
  },

  saveSet: (set) => {
    return storage.save('sets', set);
  },

  deleteSet: (id) => {
    return storage.delete('sets', id);
  },

  deleteSetsByExerciseId: (exerciseId) => {
    const allSets = storage.getAll('sets');
    const toKeep = allSets.filter((set) => set.exercise_id !== exerciseId);
    storage.replaceAll('sets', toKeep);
  },

  getCardioByWorkoutId: (workoutId) => {
    const allCardio = storage.getAll('cardio');
    return allCardio.filter((entry) => entry.workout_id === workoutId);
  },

  saveCardio: (cardio) => {
    return storage.save('cardio', cardio);
  },

  deleteCardio: (id) => {
    return storage.delete('cardio', id);
  },

  deleteCardioByWorkoutId: (workoutId) => {
    const allCardio = storage.getAll('cardio');
    const toKeep = allCardio.filter((entry) => entry.workout_id !== workoutId);
    storage.replaceAll('cardio', toKeep);
  },

  getAllPhotos: () => {
    return storage.getAll('photos');
  },

  savePhoto: (photo) => {
    return storage.save('photos', photo);
  },

  deletePhoto: (id) => {
    return storage.delete('photos', id);
  },

  getUserProfile: () => {
    return storage.getAll('userProfile')[0] || null;
  },

  saveUserProfile: (profile) => {
    storage.replaceAll('userProfile', [profile]);
    return profile;
  },
};

export default StorageService;