import StorageService from './StorageService';

beforeEach(() => {
  localStorage.clear();
});

describe('Workout Operations', () => {
  test('should save a new workout and return it with an ID', () => {
    const workout = {
      date: '2026-02-12',
      name: 'Shoulders + Triceps',
      notes: 'Felt strong today',
      duration: 65,
    };

    const saved = StorageService.saveWorkout(workout);

    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('Shoulders + Triceps');
    expect(saved.duration).toBe(65);
  });

  test('should retrieve all workouts', () => {
    StorageService.saveWorkout({
      date: '2026-02-10',
      name: 'Legs + Biceps',
    });
    StorageService.saveWorkout({
      date: '2026-02-12',
      name: 'Chest + Triceps',
    });

    const workouts = StorageService.getAllWorkouts();

    expect(workouts).toHaveLength(2);
    expect(workouts[0].name).toBe('Legs + Biceps');
    expect(workouts[1].name).toBe('Chest + Triceps');
  });

  test('should retrieve a workout by ID', () => {
    const saved = StorageService.saveWorkout({
      date: '2026-02-12',
      name: 'Back + Biceps',
    });

    const found = StorageService.getWorkoutById(saved.id);

    expect(found).not.toBeNull();
    expect(found.name).toBe('Back + Biceps');
  });

  test('should return null for a non-existent workout ID', () => {
    const found = StorageService.getWorkoutById('fake-id-123');

    expect(found).toBeNull();
  });

  test('should update an existing workout', () => {
    const saved = StorageService.saveWorkout({
      date: '2026-02-12',
      name: 'Shoulders + Triceps',
      duration: 45,
    });

    StorageService.saveWorkout({
      id: saved.id,
      name: 'Shoulders + Triceps',
      duration: 65,
    });

    const updated = StorageService.getWorkoutById(saved.id);
    expect(updated.duration).toBe(65);
  });

  test('should delete a workout and cascade delete its exercises and sets', () => {
    const workout = StorageService.saveWorkout({
      date: '2026-02-12',
      name: 'Shoulders + Triceps',
    });

    const exercise = StorageService.saveExercise({
      workout_id: workout.id,
      name: 'Shoulder Press Dumbbells',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 1,
      reps: 12,
      weight: 28,
      unit: 'kg',
    });

    StorageService.deleteWorkout(workout.id);

    expect(StorageService.getAllWorkouts()).toHaveLength(0);
    expect(StorageService.getExercisesByWorkoutId(workout.id)).toHaveLength(0);
    expect(StorageService.getSetsByExerciseId(exercise.id)).toHaveLength(0);
  });
});

describe('Exercise Operations', () => {
  test('should save exercises linked to a workout', () => {
    const workout = StorageService.saveWorkout({
      date: '2026-02-12',
      name: 'Shoulders + Triceps',
    });

    StorageService.saveExercise({
      workout_id: workout.id,
      name: 'Shoulder Press Dumbbells',
    });

    StorageService.saveExercise({
      workout_id: workout.id,
      name: 'Tricep Rope Pushdown',
    });

    const exercises = StorageService.getExercisesByWorkoutId(workout.id);

    expect(exercises).toHaveLength(2);
    expect(exercises[0].name).toBe('Shoulder Press Dumbbells');
    expect(exercises[1].name).toBe('Tricep Rope Pushdown');
  });

  test('should only return exercises for the specified workout', () => {
    const workout1 = StorageService.saveWorkout({ name: 'Legs + Biceps' });
    const workout2 = StorageService.saveWorkout({
      name: 'Shoulders + Triceps',
    });

    StorageService.saveExercise({
      workout_id: workout1.id,
      name: 'Squat',
    });
    StorageService.saveExercise({
      workout_id: workout2.id,
      name: 'Shoulder Press Dumbbells',
    });

    const legExercises = StorageService.getExercisesByWorkoutId(workout1.id);

    expect(legExercises).toHaveLength(1);
    expect(legExercises[0].name).toBe('Squat');
  });
});

describe('Set Operations', () => {
  test('should save individual sets with different weights', () => {
    const workout = StorageService.saveWorkout({
      name: 'Shoulders + Triceps',
    });

    const exercise = StorageService.saveExercise({
      workout_id: workout.id,
      name: 'Shoulder Press Dumbbells',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 1,
      reps: 12,
      weight: 28,
      unit: 'kg',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 2,
      reps: 10,
      weight: 30,
      unit: 'kg',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 3,
      reps: 8,
      weight: 32,
      unit: 'kg',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 4,
      reps: 8,
      weight: 32,
      unit: 'kg',
    });

    const sets = StorageService.getSetsByExerciseId(exercise.id);

    expect(sets).toHaveLength(4);
    expect(sets[0].weight).toBe(28);
    expect(sets[1].weight).toBe(30);
    expect(sets[2].weight).toBe(32);
    expect(sets[3].weight).toBe(32);
  });

  test('should return sets in order by set number', () => {
    const exercise = StorageService.saveExercise({
      workout_id: 'test',
      name: 'Bench Press',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 3,
      reps: 6,
      weight: 90,
      unit: 'kg',
    });
    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 1,
      reps: 10,
      weight: 70,
      unit: 'kg',
    });
    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 2,
      reps: 8,
      weight: 80,
      unit: 'kg',
    });

    const sets = StorageService.getSetsByExerciseId(exercise.id);

    expect(sets[0].set_number).toBe(1);
    expect(sets[1].set_number).toBe(2);
    expect(sets[2].set_number).toBe(3);
  });

  test('should delete all sets when exercise is deleted', () => {
    const exercise = StorageService.saveExercise({
      workout_id: 'test',
      name: 'Lateral Raise',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 1,
      reps: 15,
      weight: 10,
      unit: 'kg',
    });

    StorageService.saveSet({
      exercise_id: exercise.id,
      set_number: 2,
      reps: 12,
      weight: 12,
      unit: 'kg',
    });

    StorageService.deleteExercise(exercise.id);

    const sets = StorageService.getSetsByExerciseId(exercise.id);
    expect(sets).toHaveLength(0);
  });
});

describe('Photo Operations', () => {
  test('should save and retrieve photos', () => {
    StorageService.savePhoto({
      date: '2026-02-12',
      tags: 'shoulders',
      notes: 'Week 1',
    });

    const photos = StorageService.getAllPhotos();

    expect(photos).toHaveLength(1);
    expect(photos[0].tags).toBe('shoulders');
  });

  test('should delete a photo', () => {
    const saved = StorageService.savePhoto({
      date: '2026-02-12',
      tags: 'back day',
    });

    StorageService.deletePhoto(saved.id);

    const photos = StorageService.getAllPhotos();
    expect(photos).toHaveLength(0);
  });
});

describe('User Profile Operations', () => {
  test('should save and retrieve user profile', () => {
    StorageService.saveUserProfile({
      name: 'Kellan',
      preferredUnit: 'kg',
    });

    const profile = StorageService.getUserProfile();

    expect(profile.name).toBe('Kellan');
    expect(profile.preferredUnit).toBe('kg');
  });

  test('should return null if no profile exists', () => {
    const profile = StorageService.getUserProfile();

    expect(profile).toBeNull();
  });
});