const db = require('../models/db');

exports.getAll = async (req, res) => {
  try {
    const { type, month, year } = req.query;
    let q = 'SELECT * FROM budget_entries WHERE user_id = $1';
    const params = [req.userId];
    if (type)  { params.push(type);  q += ` AND type = $${params.length}`; }
    if (month) { params.push(month); q += ` AND EXTRACT(MONTH FROM entry_date) = $${params.length}`; }
    if (year)  { params.push(year);  q += ` AND EXTRACT(YEAR  FROM entry_date) = $${params.length}`; }
    q += ' ORDER BY entry_date DESC, created_at DESC';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.summary = async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    const { rows } = await db.query(
      `SELECT
         type,
         SUM(ABS(amount)) AS total,
         COUNT(*) AS count
       FROM budget_entries
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM entry_date) = $2
         AND EXTRACT(YEAR  FROM entry_date) = $3
       GROUP BY type`,
      [req.userId, month, year],
    );
    const income  = rows.find(r => r.type === 'Income')?.total  ?? 0;
    const expense = rows.find(r => r.type === 'Expense')?.total ?? 0;
    res.json({ income: +income, expense: +expense, balance: +income - +expense });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { description, amount, type, category, entry_date, notes } = req.body;
    if (!description || amount === undefined || !type || !category)
      return res.status(400).json({ message: 'description, amount, type and category are required' });
    const { rows } = await db.query(
      `INSERT INTO budget_entries (user_id, description, amount, type, category, entry_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, description, amount, type, category, entry_date ?? new Date(), notes ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, type, category, entry_date, notes } = req.body;
    const { rows } = await db.query(
      `UPDATE budget_entries SET
        description = COALESCE($1, description),
        amount      = COALESCE($2, amount),
        type        = COALESCE($3, type),
        category    = COALESCE($4, category),
        entry_date  = COALESCE($5, entry_date),
        notes       = COALESCE($6, notes)
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [description, amount, type, category, entry_date, notes, id, req.userId],
    );
    if (!rows.length) return res.status(404).json({ message: 'Entry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM budget_entries WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
