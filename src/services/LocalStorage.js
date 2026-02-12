export class LocalStorage {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getAll(collection) {
    const data = localStorage.getItem(collection);
    return data ? JSON.parse(data) : [];
  }

  getById(collection, id) {
    const all = this.getAll(collection);
    return all.find((item) => item.id === id) || null;
  }

  save(collection, record) {
    const all = this.getAll(collection);

    if (record.id) {
      const index = all.findIndex((item) => item.id === record.id);
      if (index !== -1) {
        all[index] = { ...all[index], ...record };
      } else {
        all.push(record);
      }
    } else {
      record.id = this.generateId();
      all.push(record);
    }

    localStorage.setItem(collection, JSON.stringify(all));
    return record;
  }

  delete(collection, id) {
    const all = this.getAll(collection);
    const filtered = all.filter((item) => item.id !== id);
    localStorage.setItem(collection, JSON.stringify(filtered));
    return id;
  }

  replaceAll(collection, records) {
    localStorage.setItem(collection, JSON.stringify(records));
  }
}
