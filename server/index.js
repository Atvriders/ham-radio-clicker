// ============================================================
// Ham Radio Clicker — Backend Server (Express + SQLite)
// ============================================================

import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ---- Ensure data directory exists ----
const dataDir = path.join(ROOT, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ---- SQLite setup ----
const db = new Database(path.join(dataDir, 'hamclicker.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    callsign TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    save_data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    callsign TEXT NOT NULL,
    total_qsos REAL DEFAULT 0,
    qso_per_second REAL DEFAULT 0,
    stations_owned INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    license_class TEXT DEFAULT 'Unlicensed',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ---- Prepared statements ----
const stmts = {
  findUser: db.prepare('SELECT id, callsign, created_at FROM users WHERE callsign = ?'),
  createUser: db.prepare('INSERT INTO users (callsign) VALUES (?)'),
  upsertSave: db.prepare(`
    INSERT INTO saves (user_id, save_data, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET save_data = excluded.save_data, updated_at = datetime('now')
  `),
  getSave: db.prepare('SELECT save_data FROM saves WHERE user_id = ?'),
  getLeaderboard: db.prepare(`
    SELECT callsign, total_qsos, qso_per_second, stations_owned, achievements_count, license_class
    FROM leaderboard
    ORDER BY total_qsos DESC
    LIMIT 50
  `),
  upsertLeaderboard: db.prepare(`
    INSERT INTO leaderboard (user_id, callsign, total_qsos, qso_per_second, stations_owned, achievements_count, license_class, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      callsign = excluded.callsign,
      total_qsos = excluded.total_qsos,
      qso_per_second = excluded.qso_per_second,
      stations_owned = excluded.stations_owned,
      achievements_count = excluded.achievements_count,
      license_class = excluded.license_class,
      updated_at = datetime('now')
  `),
};

// ---- Express app ----
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ---- Auth endpoints ----

app.post('/api/auth/login', (req, res) => {
  const { callsign } = req.body;
  if (!callsign || typeof callsign !== 'string' || callsign.trim().length === 0) {
    return res.status(400).json({ error: 'Callsign required' });
  }

  const normalized = callsign.trim().toUpperCase();
  let user = stmts.findUser.get(normalized);
  let isNew = false;

  if (!user) {
    const result = stmts.createUser.run(normalized);
    user = { id: result.lastInsertRowid, callsign: normalized, created_at: new Date().toISOString() };
    isNew = true;
  }

  res.json({ id: user.id, callsign: user.callsign, isNew });
});

app.get('/api/auth/me', (req, res) => {
  const callsign = req.query.callsign;
  if (!callsign) return res.status(400).json({ error: 'Callsign required' });

  const user = stmts.findUser.get(String(callsign).toUpperCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ id: user.id, callsign: user.callsign });
});

// ---- Save endpoints ----

app.post('/api/save', (req, res) => {
  const { callsign, saveData } = req.body;
  if (!callsign || !saveData) return res.status(400).json({ error: 'callsign and saveData required' });

  const user = stmts.findUser.get(String(callsign).toUpperCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const dataStr = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);
  stmts.upsertSave.run(user.id, dataStr);

  res.json({ ok: true });
});

app.get('/api/save', (req, res) => {
  const callsign = req.query.callsign;
  if (!callsign) return res.status(400).json({ error: 'Callsign required' });

  const user = stmts.findUser.get(String(callsign).toUpperCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const row = stmts.getSave.get(user.id);
  if (!row) return res.json({ saveData: null });

  try {
    res.json({ saveData: JSON.parse(row.save_data) });
  } catch {
    res.json({ saveData: null });
  }
});

// ---- Leaderboard endpoints ----

app.get('/api/leaderboard', (_req, res) => {
  const rows = stmts.getLeaderboard.all();
  res.json(rows);
});

app.post('/api/leaderboard', (req, res) => {
  const { callsign, totalQsos, qsoPerSecond, stationsOwned, achievementsCount, licenseClass } = req.body;
  if (!callsign) return res.status(400).json({ error: 'callsign required' });

  const user = stmts.findUser.get(String(callsign).toUpperCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  stmts.upsertLeaderboard.run(
    user.id,
    user.callsign,
    totalQsos ?? 0,
    qsoPerSecond ?? 0,
    stationsOwned ?? 0,
    achievementsCount ?? 0,
    licenseClass ?? 'Unlicensed',
  );

  res.json({ ok: true });
});

// ---- Production: serve static files ----
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(ROOT, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ---- Start server ----
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Ham Radio Clicker server running on http://localhost:${PORT}`);
});
