const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Accepts 07XXXXXXXX, 7XXXXXXXX, 2507XXXXXXXX or +2507XXXXXXXX and stores it as 07XXXXXXXX
function normalizePhone(input) {
  let p = String(input || '').replace(/[\s-]/g, '');
  if (p.startsWith('+250')) p = '0' + p.slice(4);
  else if (p.startsWith('250')) p = '0' + p.slice(3);
  else if (/^7\d{8}$/.test(p)) p = '0' + p;
  return /^07\d{8}$/.test(p) ? p : null;
}

function makeToken(user) {
  return jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// FR1.1 - create an account with a phone number
router.post('/register', async (req, res) => {
  const { fullName, phoneNumber, password } = req.body;
  const phone = normalizePhone(phoneNumber);

  if (!fullName || fullName.trim().length < 2)
    return res.status(400).json({ field: 'fullName', error: 'Please enter your full name.' });
  if (!phone)
    return res.status(400).json({ field: 'phoneNumber', error: 'Enter a valid phone number, e.g. 0788123456.' });
  if (!password || password.length < 6)
    return res.status(400).json({ field: 'password', error: 'Password must be at least 6 characters.' });

  try {
    const [existing] = await pool.query('SELECT user_id FROM users WHERE phone_number = ?', [phone]);
    if (existing.length)
      return res.status(409).json({ field: 'phoneNumber', error: 'This phone number is already registered.' });

    const hash = await bcrypt.hash(password, 10);
    // CHANGED: RETURNING user_id asks PostgreSQL for the new user's ID
    const [result] = await pool.query(
      'INSERT INTO users (full_name, phone_number, password_hash) VALUES (?, ?, ?) RETURNING user_id',
      [fullName.trim(), phone, hash]
    );
    // CHANGED: the ID now comes from result.rows[0].user_id
    const token = makeToken({ user_id: result.rows[0].user_id, role: 'tradesperson' });
    res.status(201).json({ token, fullName: fullName.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  const phone = normalizePhone(req.body.phoneNumber);
  const { password } = req.body;
  if (!phone || !password)
    return res.status(400).json({ error: 'Enter your phone number and password.' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phone]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Wrong phone number or password.' });

    res.json({ token: makeToken(user), fullName: user.full_name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;