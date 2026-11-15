# TradeLink

A free web directory that connects informal skilled tradespeople in Rwanda (plumbers, electricians, masons, carpenters) with clients. No documents and no fees: a phone number and a basic profile is enough to get found.

Built for the ALU Job Creation mission. See the SRS for the full requirements.

## Status (Sprint 1: Registration and Profiles)

| Requirement | Feature | Status |
|---|---|---|
| FR1.1 | Create account with a phone number | Done |
| FR2.1 | Build profile (trade, area, years of experience, bio) | Done |
| FR2.2 | Edit profile | Done |
| FR2.3 | Set availability | Done |
| FR3.1 | Client search by trade | Sprint 2 |
| FR3.2 | Filter by location | Sprint 2 |
| FR3.3 | View contact details | Sprint 2 |
| FR4.1 | Admin approves profiles | Sprint 3 (new profiles are already saved as "pending") |

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
5. Start the server:
   ```
   npm start
   ```
6. Open http://localhost:3000 in your browser (or on your phone, using your computer's IP address on the same Wi-Fi).

## Project structure

```
database/schema.sql      tables: users, trade_categories, locations, profiles
src/server.js            starts the app
src/db.js                MySQL connection
src/middleware/auth.js   checks the login token
src/routes/auth.js       POST /api/auth/register, POST /api/auth/login
src/routes/profile.js    GET /api/lookups, GET/PUT /api/profile/me, PATCH /api/profile/me/availability
public/                  register.html, login.html, profile.html, css/style.css, js/app.js
```

## API (Sprint 1)

| Method | Path | What it does |
|---|---|---|
| POST | /api/auth/register | create an account (fullName, phoneNumber, password) |
| POST | /api/auth/login | log in, returns a token |
| GET | /api/lookups | trades and areas for the dropdowns |
| GET | /api/profile/me | my profile (null if not built yet) |
| PUT | /api/profile/me | build or edit my profile |
| PATCH | /api/profile/me/availability | set available / unavailable |

## Notes

- Phone numbers are accepted as 0788123456, 788123456, 250788123456 or +250788123456 and stored as 07XXXXXXXX.
- Pilot areas are Kigali's three districts (Gasabo, Kicukiro, Nyarugenge). Sectors can be added to the `locations` table later.
- Not done yet: Kinyarwanda interface (NFR), admin screen, client search.
