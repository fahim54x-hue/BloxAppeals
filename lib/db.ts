import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "appeals.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS appeals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    app_password TEXT,
    extra_info TEXT,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt INTEGER,
    created_at INTEGER DEFAULT (unixepoch())
  )
`);

export default db;
