# TradeLink

A free web directory that connects informal skilled tradespeople in Rwanda (plumbers, electricians, masons, carpenters) with clients. No documents and no fees: a phone number and a basic profile is enough to get found.

Built for the ALU Job Creation mission. See the SRS for the full requirements.

## Status (Sprints 1 and 2 done, admin approval built)

| Requirement | Feature | Status |
|---|---|---|
| FR1.1 | Create account with a phone number | Done |
| FR2.1 | Build profile (trade, area, years of experience, bio) | Done |
| FR2.2 | Edit profile | Done |
| FR2.3 | Set availability | Done |
| FR3.1 | Client search by trade | Done |
| FR3.2 | Filter by location | Done |
| FR3.3 | View contact details | Done |
| FR4.1 | Admin approves or rejects profiles | Done |

## Tech stack

- Backend: Node.js + Express
- Database: MySQL (mysql2)
- Auth: JWT + bcrypt (passwords are never stored in plain text)
- Frontend: plain HTML, CSS and JavaScript, mobile-first with large tap targets

## How to run it

1. Install Node.js (v18 or newer) and MySQL.
2. Install the packages:
   ```
   npm install
   ```
3. Create the database and tables:
   ```
   mysql -u root -p < database/schema.sql
   ```
4. Copy `.env.example` to `.env` and fill in your MySQL password and a long random `JWT_SECRET`.
5. (Optional, for the admin page) Register a normal account in the app first, then make it an admin and log in again:
   ```
   npm run make-admin -- 0788123456
   ```
6. Start the server:
   ```
   npm start
   ```
7. Open http://localhost:3000 in your browser (or on your phone, using your computer's IP address on the same Wi-Fi).

## Project structure

```
database/schema.sql      tables: users, trade_categories, locations, profiles
src/server.js            starts the app
src/db.js                MySQL connection
src/middleware/auth.js   checks the login token
src/routes/auth.js       POST /api/auth/register, POST /api/auth/login
src/routes/profile.js    GET /api/lookups, GET/PUT /api/profile/me, PATCH /api/profile/me/availability
src/routes/search.js     GET /api/search, GET /api/profiles/:id
src/routes/admin.js      GET /api/admin/profiles, PATCH /api/admin/profiles/:id
src/middleware/rateLimit.js  limits contact lookups to 30 per minute per IP
scripts/make-admin.js    turns a registered user into an admin
public/                  search.html, register.html, login.html, profile.html, admin.html, css/style.css, js/app.js
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
| PATCH | /api/admin/profiles/:id | admin only: approve or reject (status: approved / rejected) |

## Notes

- Phone numbers are accepted as 0788123456, 788123456, 250788123456 or +250788123456 and stored as 07XXXXXXXX.
- Pilot areas are Kigali's three districts (Gasabo, Kicukiro, Nyarugenge). Sectors can be added to the `locations` table later.
- How it works: a tradesperson registers and builds a profile (saved as "pending"). An admin approves it on /admin.html. Only approved profiles that are marked available show up in the client search. If a rejected profile is edited, it goes back to "pending".
- Clients do not need an account. Contact details are only shown when a client taps "View contact".
- Not done yet: Kinyarwanda interface (NFR), public deployment.
