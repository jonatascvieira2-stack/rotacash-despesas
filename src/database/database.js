import * as SQLite from 'expo-sqlite';

const DB_NAME = 'rotacash_despesas.db';
let dbInstance = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDatabase();
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      total_budget REAL DEFAULT 0,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      trip_id TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      description TEXT,
      receipt_image_uri TEXT,
      ocr_extracted INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
    );
  `);

  const trips = await db.getAllAsync('SELECT * FROM trips LIMIT 1;');
  if (trips.length === 0) {
    const defaultTripId = 'trip_default_1';
    await db.runAsync(
      'INSERT INTO trips (id, title, start_date, total_budget, status) VALUES (?, ?, ?, ?, ?);',
      [defaultTripId, 'Viagem Atual', new Date().toISOString(), 3000, 'active']
    );
  }

  return true;
}

export async function getExpensesByTrip(tripId) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC, created_at DESC;',
    [tripId]
  );
}

export async function addExpense(expense) {
  const db = await getDatabase();
  const id = expense.id || 'exp_' + Date.now();
  const createdAt = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO expenses (
      id, trip_id, category, amount, date, payment_method, description, receipt_image_uri, ocr_extracted, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      expense.tripId || 'trip_default_1',
      expense.category || 'combustivel',
      expense.amount,
      expense.date || new Date().toISOString().split('T')[0],
      expense.paymentMethod || 'pix',
      expense.description || '',
      expense.receiptImageUri || null,
      expense.ocrExtracted ? 1 : 0,
      createdAt
    ]
  );

  return id;
}

export async function deleteExpense(expenseId) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?;', [expenseId]);
}
