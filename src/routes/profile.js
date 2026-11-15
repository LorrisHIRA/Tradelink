const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Dropdown data for the profile form
router.get('/lookups', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT category_id AS id, name FROM trade_categories ORDER BY name');
    const [locations] = await pool.query('SELECT location_id AS id, district, sector FROM locations ORDER BY district');
    res.json({ categories, locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load options.' });
  }
});

// Get my own profile (profile is null if I have not built one yet)
router.get('/profile/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.full_name AS fullName, u.phone_number AS phoneNumber,
              p.category_id AS categoryId, p.location_id AS locationId,
              p.bio, p.years_experience AS yearsExperience,
              p.availability, p.status
       FROM users u LEFT JOIN profiles p ON p.user_id = u.user_id
       WHERE u.user_id = ?`,
      [req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    const r = rows[0];
    res.json({
      fullName: r.fullName,
      phoneNumber: r.phoneNumber,
      profile: r.categoryId === null ? null : {
        categoryId: r.categoryId,
        locationId: r.locationId,
        bio: r.bio,
        yearsExperience: r.yearsExperience,
        availability: !!r.availability,
        status: r.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your profile.' });
  }
});

// FR2.1 build profile / FR2.2 edit profile
router.put('/profile/me', requireAuth, async (req, res) => {
  const { categoryId, locationId, yearsExperience, bio } = req.body;
  const years = Number(yearsExperience);

  if (!categoryId) return res.status(400).json({ field: 'categoryId', error: 'Choose your trade.' });
  if (!locationId) return res.status(400).json({ field: 'locationId', error: 'Choose your area.' });
  if (!Number.isInteger(years) || years < 0 || years > 60)
    return res.status(400).json({ field: 'yearsExperience', error: 'Enter your years of experience (0 to 60).' });
  if (bio && bio.length > 500)
    return res.status(400).json({ field: 'bio', error: 'Bio must be 500 characters or less.' });

  try {
    // New profiles start as "pending" until an admin approves them (FR4.1).
    // Editing an existing profile keeps its current status.
    await pool.query(
      `INSERT INTO profiles (user_id, category_id, location_id, years_experience, bio)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), location_id = VALUES(location_id),
                               years_experience = VALUES(years_experience), bio = VALUES(bio)`,
      [req.user.userId, categoryId, locationId, years, bio || null]
    );
    res.json({ message: 'Profile saved.' });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2')
      return res.status(400).json({ error: 'Invalid trade or area selected.' });
    console.error(err);
    res.status(500).json({ error: 'Could not save your profile.' });
  }
});

// FR2.3 set availability
router.patch('/profile/me/availability', requireAuth, async (req, res) => {
  if (typeof req.body.availability !== 'boolean')
    return res.status(400).json({ error: 'availability must be true or false.' });
  try {
    const [result] = await pool.query(
      'UPDATE profiles SET availability = ? WHERE user_id = ?',
      [req.body.availability, req.user.userId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Build your profile first.' });
    res.json({ availability: req.body.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update availability.' });
  }
});

module.exports = router;
