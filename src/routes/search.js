const express = require('express');
const pool = require('../db');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Contact details: max 30 lookups per minute per IP
const contactLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// FR3.1 search by trade, FR3.2 filter by location.
// Clients do not need an account. Only approved AND available profiles are shown.
router.get('/search', async (req, res) => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
  const locationId = req.query.locationId ? Number(req.query.locationId) : null;

  if ((categoryId !== null && !Number.isInteger(categoryId)) ||
      (locationId !== null && !Number.isInteger(locationId)))
    return res.status(400).json({ error: 'Invalid search options.' });

  let sql = `SELECT p.profile_id AS id, u.full_name AS fullName, c.name AS trade,
                    l.district, l.sector, p.years_experience AS yearsExperience, p.bio
             FROM profiles p
             JOIN users u            ON u.user_id = p.user_id
             JOIN trade_categories c ON c.category_id = p.category_id
             JOIN locations l        ON l.location_id = p.location_id
             WHERE p.status = 'approved' AND p.availability = TRUE`;
  const params = [];
  if (categoryId !== null) { sql += ' AND p.category_id = ?'; params.push(categoryId); }
  if (locationId !== null) { sql += ' AND p.location_id = ?'; params.push(locationId); }
  sql += ' ORDER BY p.years_experience DESC LIMIT 50';

  try {
    const [rows] = await pool.query(sql, params);
    res.json({ results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

// FR3.3 view contact details of one approved profile
router.get('/profiles/:id', contactLimiter, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid profile.' });

  try {
    const [rows] = await pool.query(
      `SELECT p.profile_id AS id, u.full_name AS fullName, u.phone_number AS phoneNumber,
              c.name AS trade, l.district, l.sector,
              p.years_experience AS yearsExperience, p.bio, p.availability
       FROM profiles p
       JOIN users u            ON u.user_id = p.user_id
       JOIN trade_categories c ON c.category_id = p.category_id
       JOIN locations l        ON l.location_id = p.location_id
       WHERE p.profile_id = ? AND p.status = 'approved'`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Profile not found.' });
    const r = rows[0];
    res.json({ ...r, availability: !!r.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load contact details.' });
  }
});

module.exports = router;
