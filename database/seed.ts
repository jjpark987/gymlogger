import { getDatabase } from './index';

export async function seedDays() {
  const db = getDatabase();
  const weekdays = [
    { id: 0, name: 'Monday' },
    { id: 1, name: 'Tuesday' },
    { id: 2, name: 'Wednesday' },
    { id: 3, name: 'Thursday' },
    { id: 4, name: 'Friday' },
  ];

  const existingDays = await db.getAllAsync<{ id: number }>(`SELECT id FROM day;`);
  const existingIds = new Set(existingDays.map(day => day.id));

  for (const day of weekdays) {
    if (!existingIds.has(day.id)) {
      await db.runAsync(
        `INSERT INTO day (id, name) VALUES (?, ?);`,
        [day.id, day.name]
      );
    }
  }
}
