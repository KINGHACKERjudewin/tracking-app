const db = require('../models/db');

exports.getAll = async (req, res) => {
  try {
    const { status, category } = req.query;
    let q = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [req.userId];
    if (status)   { params.push(status);   q += ` AND status = $${params.length}`; }
    if (category) { params.push(category); q += ` AND category = $${params.length}`; }
    q += ' ORDER BY created_at DESC';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, category = 'Work', priority = 'Medium', status = 'Todo',
            due_date, estimated_hours = 0, estimated_minutes = 0, notes } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const { rows } = await db.query(
      `INSERT INTO tasks (user_id, title, category, priority, status, due_date, estimated_hours, estimated_minutes, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.userId, title, category, priority, status, due_date ?? null, estimated_hours, estimated_minutes, notes ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, priority, status, due_date, estimated_hours, estimated_minutes, notes } = req.body;
    const { rows } = await db.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        priority = COALESCE($3, priority),
        status = COALESCE($4, status),
        due_date = COALESCE($5, due_date),
        estimated_hours = COALESCE($6, estimated_hours),
        estimated_minutes = COALESCE($7, estimated_minutes),
        notes = COALESCE($8, notes)
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [title, category, priority, status, due_date, estimated_hours, estimated_minutes, notes, id, req.userId],
    );
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
