const db = require('../models/db');

exports.getSessions = async (req, res) => {
  try {
    const { date } = req.query;
    let q = 'SELECT * FROM time_sessions WHERE user_id = $1';
    const params = [req.userId];
    if (date) { params.push(date); q += ` AND DATE(started_at) = $${params.length}`; }
    q += ' ORDER BY started_at DESC LIMIT 100';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.start = async (req, res) => {
  try {
    const { task_name, task_id, notes } = req.body;
    if (!task_name) return res.status(400).json({ message: 'task_name is required' });
    const { rows } = await db.query(
      `INSERT INTO time_sessions (user_id, task_name, task_id, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.userId, task_name, task_id ?? null, notes ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.stop = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const { rows } = await db.query(
      `UPDATE time_sessions SET
        ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT,
        notes = COALESCE($1, notes)
       WHERE id = $2 AND user_id = $3 AND ended_at IS NULL RETURNING *`,
      [notes ?? null, id, req.userId],
    );
    if (!rows.length) return res.status(404).json({ message: 'Session not found or already stopped' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM time_sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.todaySummary = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) AS sessions,
         SUM(duration_seconds) AS total_seconds,
         SUM(CASE WHEN ended_at IS NULL THEN 1 ELSE 0 END) AS active
       FROM time_sessions
       WHERE user_id = $1 AND DATE(started_at) = CURRENT_DATE`,
      [req.userId],
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
