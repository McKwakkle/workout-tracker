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
    return storage.delete('exercises', id);
  },

  deleteExercisesByWorkoutId: (workoutId) => {
    const allExercises = storage.getAll('exercises');
    const toKeep = allExercises.filter(
      (exercise) => exercise.workout_id !== workoutId
    );
    storage.replaceAll('exercises', toKeep);
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