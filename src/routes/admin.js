const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// FR4.1 list profiles waiting for review (or filter by another status)
router.get('/profiles', async (req, res) => {
  const status = req.query.status || 'pending';
  if (!['pending', 'approved', 'rejected'].includes(status))
    return res.status(400).json({ error: 'Invalid status.' });

  try {
    const [rows] = await pool.query(
      `SELECT p.profile_id AS id, u.full_name AS fullName, u.phone_number AS phoneNumber,
              c.name AS trade, l.district, l.sector,
              p.years_experience AS yearsExperience, p.bio, p.status, p.created_at AS createdAt
       FROM profiles p
       JOIN users u            ON u.user_id = p.user_id
       JOIN trade_categories c ON c.category_id = p.category_id
       JOIN locations l        ON l.location_id = p.location_id
       WHERE p.status = ?
       ORDER BY p.created_at ASC`,
      [status]
    );
    res.json({ profiles: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profiles.' });
  }
});

// FR4.1 approve or reject a profile
router.patch('/profiles/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid profile.' });
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ error: 'Status must be approved or rejected.' });

  try {
    const [result] = await pool.query('UPDATE profiles SET status = ? WHERE profile_id = ?', [status, id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update the profile.' });
  }
});

module.exports = router;
