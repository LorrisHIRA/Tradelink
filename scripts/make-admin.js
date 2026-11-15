// Makes an existing user an admin. Usage: npm run make-admin -- 0788123456
// The person must already have registered. They need to log in again afterwards.
require('dotenv').config();
const pool = require('../src/db');

(async () => {
  const phone = process.argv[2];
  if (!phone) {
    console.error('Usage: npm run make-admin -- <phone number, e.g. 0788123456>');
    process.exit(1);
  }
  const [result] = await pool.query("UPDATE users SET role = 'admin' WHERE phone_number = ?", [phone]);
  console.log(result.affectedRows ? `${phone} is now an admin. Log in again to use it.` : `No user found with phone ${phone}. Register first.`);
  await pool.end();
})();
