require('dotenv').config();
const path = require('path');
const express = require('express');

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/profile'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TradeLink running on http://localhost:${port}`));
