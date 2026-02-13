function ExerciseBlock({ exercise, onUpdate, onRemove }) {
  const handleNameChange = (e) => {
    onUpdate({
      ...exercise,
      name: e.target.value,
    });
  };

  const handleSetChange = (setIndex, field, value) => {
    const updatedSets = exercise.sets.map((set, i) => {
      if (i === setIndex) {
        return { ...set, [field]: value };
      }
      return set;
    });
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const addSet = () => {
    const newSet = {
      set_number: exercise.sets.length + 1,
      reps: '',
      weight: '',
      unit: 'kg',
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setIndex) => {
    const updatedSets = exercise.sets
      .filter((_, i) => i !== setIndex)
      .map((set, i) => ({ ...set, set_number: i + 1 }));
    onUpdate({ ...exercise, sets: updatedSets });
  };

  return (
    <div className="exercise-block">
      <div className="exercise-header">
        <input
          type="text"
          className="exercise-name-input"
          placeholder="Exercise name (e.g. Shoulder Press Dumbbells)"
          value={exercise.name}
          onChange={handleNameChange}
        />
        <button className="btn-remove" onClick={onRemove}>
          ✕
        </button>
      </div>

      <div className="sets-table">
        <div className="sets-header">
          <span className="set-col">Set</span>
          <span className="weight-col">Weight</span>
          <span className="unit-col">Unit</span>
          <span className="reps-col">Reps</span>
          <span className="action-col"></span>
        </div>

        {exercise.sets.map((set, index) => (
          <div className="set-row" key={index}>
            <span className="set-col">{set.set_number}</span>
            <input
              type="number"
              className="weight-col"
              placeholder="0"
              value={set.weight}
              onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
            />
            <select
              className="unit-col"
              value={set.unit}
              onChange={(e) => handleSetChange(index, 'unit', e.target.value)}
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
            <input
              type="number"
              className="reps-col"
              placeholder="0"
              value={set.reps}
              onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
            />
            <button className="btn-remove-set" onClick={() => removeSet(index)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn-add-set" onClick={addSet}>
        + Add Set
      </button>
    </div>
  );
}

export default ExerciseBlock;
