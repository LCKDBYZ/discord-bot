import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../data/deadlines.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS deadlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        title TEXT NOT NULL,
        due_date TEXT NOT NULL,
        done INTEGER DEFAULT 0
    )
`);

export function addDeadline(subject: string, title: string, dueDate: string) {
    const stmt = db.prepare(`
        INSERT INTO deadlines (subject, title, due_date) VALUES (?, ?, ?)
    `);
    stmt.run(subject, title, dueDate);
}

export function listDeadlines() {
    return db.prepare(`
        SELECT * FROM deadlines WHERE done = 0 ORDER BY due_date ASC
    `).all();
}

export function markDone(id: number) {
    db.prepare(`UPDATE deadlines SET done = 1 WHERE id = ?`).run(id);
}

export function clearDone() {
    db.exec(`DELETE FROM deadlines WHERE done = 1`);
}