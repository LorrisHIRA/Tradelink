require('dotenv').config();
const { Pool } = require('pg');

const isLocal = ['localhost', '127.0.0.1'].includes(process.env.DB_HOST || 'localhost');

const pg = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tradelink',
  ssl: isLocal ? false : { rejectUnauthorized: false }, // Aiven requires an encrypted connection
  max: 3, // Aiven's free plan allows few connections, and Vercel can start several copies of the app
});

// PostgreSQL lowercases column aliases like "AS fullName", so put the camelCase names back.
const CAMEL = {
  fullname: 'fullName',
  phonenumber: 'phoneNumber',
  yearsexperience: 'yearsExperience',
  categoryid: 'categoryId',
  locationid: 'locationId',
  createdat: 'createdAt',
};

function fixKeys(row) {
  const out = {};
  for (const key of Object.keys(row)) out[CAMEL[key] || key] = row[key];
  return out;
}

// The routes write "?" placeholders; PostgreSQL wants $1, $2, ...
function toPg(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => '$' + (++i));
}

// Returns the same shapes as before: [rows] for SELECT, [{ affectedRows, rows }] otherwise.
module.exports = {
  async query(sql, params = []) {
    const result = await pg.query(toPg(sql), params);
    const rows = result.rows.map(fixKeys);
    if (result.command === 'SELECT') return [rows];
    return [{ affectedRows: result.rowCount, rows }];
  },
};