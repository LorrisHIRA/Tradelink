# TradeLink

A free web directory that connects informal skilled tradespeople in Rwanda (plumbers, electricians, masons, carpenters, mechanics) with clients. No documents and no fees: a phone number and a basic profile is enough to get found.

Built for the ALU Job Creation mission. Clients do not need an account: they search by trade and area, then call or WhatsApp the tradesperson directly.

**Live app:** https://tradelink-pi.vercel.app/
(It is hosted on a free plan, so if nobody has visited for a while the first load can take about a minute. Wait and refresh.)

## Try it in 2 minutes

1. Open the live app. You land on the client search page (no login needed).
2. Click **Register free**, create a tradesperson account, and fill in your profile. It is saved as "pending".
3. An admin must approve it before clients can see it (see "Admin" below).
4. After approval, search for the trade on the home page and click **View contact**.

## Features

| Requirement | Feature | Status |
|---|---|---|
| FR1.1 | Create account with a phone number | Done |
| FR2.1 | Build profile (trade, area, years of experience, bio) | Done |
| FR2.2 | Edit profile | Done |
| FR2.3 | Set availability | Done |
| FR3.1 | Client search by trade | Done |
| FR3.2 | Filter by location | Done |
| FR3.3 | View contact details (call and WhatsApp buttons) | Done |
| FR4.1 | Admin approves or rejects profiles | Done |
| NFR | Phone numbers hidden until "View contact", rate limited | Done |
| NFR | Kinyarwanda interface | Not done yet |

## Tech stack

- Backend: Node.js + Express
- Database: MySQL (mysql2)
- Auth: JWT + bcrypt (passwords are never stored in plain text)
- Frontend: plain HTML, CSS and JavaScript, mobile-first
- Hosting: Render (app) and Aiven (MySQL database)

## Run it on your own computer

You need: **Node.js 18 or newer**, **Git**, and **MySQL** (XAMPP's MySQL works).

1. Clone the project and go into the folder:
   ```
   git clone https://github.com/LorrisHIRA/Tradelink.git
   cd Tradelink
   ```
2. Install the packages:
   ```
   npm install
   ```
3. Start MySQL (in XAMPP, click **Start** next to MySQL).
4. Create the database and tables. Easiest way: open phpMyAdmin (http://localhost/phpmyadmin, or http://localhost:8080/phpmyadmin if Apache moved to port 8080), click **Import**, choose `database/schema.sql`, and click **Import**. Or, from a terminal that supports it:
   ```
   mysql -u root -p < database/schema.sql
   ```
   This creates a `tradelink` database with the tables `users`, `profiles`, `trade_categories` and `locations`.
5. Create your settings file: copy `.env.example` to a new file named `.env` (in the project root) and fill it in:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=tradelink
   DB_SSL=false
   JWT_SECRET=any_long_random_text_at_least_30_characters
   ```
   With XAMPP the `root` password is empty, so leave `DB_PASSWORD=` blank. If your MySQL has a password, put it there. Never upload `.env` to GitHub (it is already in `.gitignore`).
6. Start the app:
   ```
   npm start
   ```
   You should see `TradeLink running on http://localhost:3000`.
7. Open http://localhost:3000 in your browser.

## Admin

New profiles only appear in search after an admin approves them.

1. Register a normal account in the app.
2. Make it an admin, using the same phone number. Either run:
   ```
   npm run make-admin -- 0788123456
   ```
   or run this SQL in phpMyAdmin:
   ```
   UPDATE users SET role='admin' WHERE phone_number='0788123456';
   ```
3. Log out and log in again with that account, then open `/admin.html` (for example http://localhost:3000/admin.html).
4. Click **Approve** or **Reject** on each pending profile.

## Deployment (how the live app is hosted)

- **Database:** a MySQL service on Aiven. `database/schema.sql` was run on it once to create the tables.
- **App:** a Render web service connected to this GitHub repo (branch `main`), with:
  - Build command: `npm install`
  - Start command: `npm start`
  - Environment variables: `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (`tradelink`) and `DB_SSL` (`true`)
- Render redeploys automatically when `main` changes.

## Project structure

```
database/schema.sql      tables: users, trade_categories, locations, profiles
src/server.js            starts the app
src/db.js                MySQL connection (supports a cloud database with SSL)
src/middleware/auth.js   checks the login token and the admin role
src/middleware/rateLimit.js  limits contact lookups to 30 per minute per IP
src/routes/auth.js       POST /api/auth/register, POST /api/auth/login
src/routes/profile.js    GET /api/lookups, GET/PUT /api/profile/me, PATCH /api/profile/me/availability
src/routes/search.js     GET /api/search, GET /api/profiles/:id
src/routes/admin.js      GET /api/admin/profiles, PATCH /api/admin/profiles/:id
scripts/make-admin.js    turns a registered user into an admin
public/                  search, register, login, profile and admin pages, plus css and js
```

## API

| Method | Path | What it does |
|---|---|---|
| POST | /api/auth/register | create an account (fullName, phoneNumber, password) |
| POST | /api/auth/login | log in, returns a token |
| GET | /api/lookups | trades and areas for the dropdowns |
| GET | /api/profile/me | my profile (null if not built yet) |
| PUT | /api/profile/me | build or edit my profile |
| PATCH | /api/profile/me/availability | set available / unavailable |
| GET | /api/search?categoryId=&locationId= | search approved, available tradespeople (no login needed) |
| GET | /api/profiles/:id | contact details of one approved profile |
| GET | /api/admin/profiles?status=pending | admin only: profiles waiting for review |
| PATCH | /api/admin/profiles/:id | admin only: approve or reject (status: approved or rejected) |

## Notes and known limits

- Phone numbers are accepted as 0788123456, 788123456, 250788123456 or +250788123456 and stored as 07XXXXXXXX.
- Pilot areas are Kigali's three districts (Gasabo, Kicukiro, Nyarugenge). Sectors can be added to the `locations` table later.
- Only approved profiles that are marked available show up in client search. If a rejected profile is edited, it goes back to "pending".
- The free hosting plan sleeps after a period of no visits, so the first load can be slow.
