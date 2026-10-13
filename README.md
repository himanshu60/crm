# CRM Lead Management

The REST API for a small CRM (Customer Relationship Management) system, built with **Node.js, Express, MongoDB and JWT**. A small **React** client is included for trying the whole flow in a browser.

Prospective students submit a public enquiry form. Counselors (employees) log in, see every unclaimed enquiry and can **claim** one. A claimed enquiry is assigned to that counselor and is no longer visible to anyone else.

## How it works

| Actor | What they do | Login? |
|---|---|---|
| Prospective client (student) | Fills the enquiry form (name, email, course interest) | No, the form is public |
| Employee / counselor | Registers or logs in, views public leads, claims leads, views their own leads | Yes, with a JWT |

1. A student submits the form (online, or shared by a counselor after a call). This creates an enquiry with `claimedBy: null`, which makes it a **public** lead.
2. Any logged-in counselor can list all public leads.
3. A counselor claims a lead, which sets `claimedBy` to their id. The lead is now **private** and leaves everyone's public list.
4. Each counselor can list the leads they have claimed.

Public and private are not separate collections. They are the same document, told apart by the `claimedBy` field.

## Acceptance criteria

- [x] Employee register and login API (JWT)
- [x] Public enquiry form API with **no** authentication
- [x] API to claim a lead
- [x] API to fetch unclaimed leads
- [x] API to fetch leads claimed by the logged-in employee

## Tech stack

**Backend:** Node.js, Express 5, MongoDB with Mongoose 9, `jsonwebtoken`, `bcryptjs`, `validator`, `cors`, `dotenv`. Dev tools: `nodemon`, ESLint 10.

**Frontend:** React 19, Vite, React Router, Axios, lucide-react icons, plain CSS, ESLint.

## Getting started

**Prerequisites:** Node.js 20+, and MongoDB running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
git clone https://github.com/himanshu60/crm.git
cd crm/server
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

The API starts on `http://localhost:5000`. Check it with `GET /api/health`.

### Environment variables (`server/.env`)

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Port the server listens on |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/crm` or `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/crm` | MongoDB connection string |
| `JWT_SECRET` | a long random string | Key used to sign tokens |
| `JWT_EXPIRES_IN` | `1d` | How long a token stays valid |

The server refuses to start if `MONGO_URI` or `JWT_SECRET` is missing.

### Run the React client (optional)

Keep the backend running, then in a second terminal:

```bash
cd crm/client
npm install
npm run dev
```

Open `http://localhost:5173`. The client calls `http://localhost:5000/api` by default. To use a different backend URL, create `client/.env` with `VITE_API_URL=<url>` (see `client/.env.example`).

| Page | Route | Login? | What it does |
|---|---|---|---|
| Enquiry form | `/` | No | Students submit an enquiry. A notice explains that only counselors can view enquiries, with links to log in or register. |
| Register / Login | `/register`, `/login` | No | Counselor account; the JWT is saved in `localStorage` |
| Dashboard | `/dashboard` | Yes | Stats, **Public leads** tab with a Claim button, **My leads** tab, and search |

- Opening the dashboard while logged out redirects to login with a "please log in to view enquiries" message, then returns to the dashboard after login.
- If another counselor claimed a lead first, a toast shows "Enquiry already claimed" and the list refreshes.
- An expired or invalid token logs the user out.
- The layout is responsive. On phones the navbar becomes a menu and lead rows become cards.

## API endpoints

Base URL: `http://localhost:5000/api`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | Health check |
| POST | `/auth/register` | – | Create an employee account |
| POST | `/auth/login` | – | Log in and get a JWT |
| POST | `/enquiries/public` | – | Submit the enquiry form (public) |
| GET | `/enquiries/public` | JWT | List unclaimed leads |
| PATCH | `/enquiries/:id/claim` | JWT | Claim a lead |
| GET | `/enquiries/private` | JWT | List leads claimed by the logged-in employee |

Protected routes need the header `Authorization: Bearer <token>`.

### Examples

**Register**: `POST /api/auth/register`
```json
{ "name": "Asha Verma", "email": "asha@example.com", "password": "secret123" }
```
Response `201`. Login (`POST /api/auth/login` with `email` and `password`) returns the same shape with `200`.
```json
{
  "message": "Employee registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "employee": { "id": "6ace3cd5377516b7fee32cf7", "name": "Asha Verma", "email": "asha@example.com" }
}
```

**Submit enquiry (public)**: `POST /api/enquiries/public`
```json
{ "name": "Ravi Kumar", "email": "ravi@example.com", "phone": "9876543210", "courseInterest": "Full Stack Web Development", "message": "Please share the fee details" }
```
`name`, `email` and `courseInterest` are required. Response `201`:
```json
{ "message": "Enquiry submitted successfully", "enquiry": { "_id": "6ace3cd5377516b7fee32cf8", "name": "Ravi Kumar", "...": "...", "claimedBy": null, "claimedAt": null } }
```

**Unclaimed leads** (`GET /api/enquiries/public`) and **my leads** (`GET /api/enquiries/private`): response `200`
```json
{ "count": 1, "enquiries": [ { "_id": "6ace3cd5377516b7fee32cf8", "name": "Ravi Kumar", "courseInterest": "Full Stack Web Development", "...": "..." } ] }
```

**Claim**: `PATCH /api/enquiries/:id/claim` with no body. Response `200`:
```json
{ "message": "Enquiry claimed successfully", "enquiry": { "_id": "6ace3cd5377516b7fee32cf8", "...": "...", "claimedBy": "6ace3cd5377516b7fee32cf7", "claimedAt": "2026-10-14T06:30:00.000Z" } }
```
If someone else claimed it first, the response is `409`: `{ "message": "Enquiry already claimed" }`

### Status codes

Every error response has the shape `{ "message": "..." }`.

| Code | When |
|---|---|
| 400 | Missing or invalid fields, an invalid enquiry id, or malformed JSON |
| 401 | Missing, invalid or expired token, or wrong email/password |
| 404 | Enquiry or route not found |
| 409 | Email already registered, or enquiry already claimed |

## Design decisions

- **Atomic claim.** A claim is one `findOneAndUpdate({ _id, claimedBy: null }, ...)`. If two counselors claim the same lead at the same moment, only one update matches. The other gets `409`, so a lead can never end up with two owners.
- **Public form accepts only the form fields.** `claimedBy` and `claimedAt` are never read from the request body, so nobody can claim a lead without logging in.
- **Passwords:** hashed with bcrypt. The field has `select: false` and is never returned in a response.
- **Login:** the same `401` message for an unknown email and a wrong password, so valid emails can't be discovered. Type checks reject NoSQL operator injection such as `{ "email": { "$ne": null } }`.
- **Tokens:** the auth middleware verifies the JWT and also checks that the employee still exists.
- **Central error handler:** Mongoose validation, cast and duplicate-key errors become clean `400` and `409` responses. Express 5 forwards async errors to it, so controllers need no try/catch.
- **Index on `{ claimedBy, createdAt }`:** serves both lead lists, which filter on `claimedBy` and sort by date.

## Data model

**Employee**: `name`, `email` (unique, lowercase), `password` (bcrypt hash), timestamps

**Enquiry**: `name`, `email`, `phone` (optional), `courseInterest`, `message` (optional), `claimedBy` (ObjectId → Employee, `null` while public), `claimedAt`, timestamps

## Folder structure

```
crm/
├── server/
│   ├── src/
│   │   ├── config/db.js              # MongoDB connection
│   │   ├── models/
│   │   │   ├── Employee.js
│   │   │   └── Enquiry.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # verify Bearer token, set req.user
│   │   │   └── errorHandler.js       # 404 + central error -> JSON
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # register, login
│   │   │   └── enquiry.controller.js # create, list public, claim, list mine
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth
│   │   │   └── enquiry.routes.js     # /api/enquiries
│   │   └── app.js                    # express app, middleware, routes
│   ├── server.js                     # load env, connect DB, start server
│   ├── eslint.config.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/axios.js              # base URL + attaches the JWT to every request
│   │   ├── context/
│   │   │   ├── AuthContext.js        # context + useAuth hook
│   │   │   └── AuthProvider.jsx      # token/employee state, login, logout
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # desktop links + mobile menu
│   │   │   ├── ProtectedRoute.jsx    # redirects to /login with a reason
│   │   │   ├── AuthLayout.jsx        # split layout for login/register
│   │   │   ├── FormField.jsx         # label + icon + input
│   │   │   ├── PasswordInput.jsx     # show/hide password
│   │   │   ├── LeadsTable.jsx        # table on desktop, cards on phones
│   │   │   ├── StatCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── EnquiryForm.jsx       # public form
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx         # stats, tabs, search, claim
│   │   ├── utils/format.js           # relative time, initials
│   │   ├── App.jsx                   # routes
│   │   ├── main.jsx
│   │   └── index.css                 # design tokens + responsive styles
│   ├── .env.example
│   └── package.json
├── CRM-API.postman_collection.json
└── README.md
```

## Testing with Postman

1. Import `CRM-API.postman_collection.json` into Postman.
2. Start the server (`npm run dev`).
3. Run the requests from top to bottom. **Register** or **Login** saves the token automatically, and **Submit Enquiry** saves `enquiryId` for **Claim Lead**.

If the server runs somewhere else, change the `baseUrl` collection variable (default `http://localhost:5000/api`).

## Scripts

| Folder | Command | What it does |
|---|---|---|
| `server/` | `npm run dev` | Start with nodemon (restarts when files change) |
| `server/` | `npm start` | Start with node |
| `server/` | `npm run lint` | Run ESLint |
| `client/` | `npm run dev` | Start the Vite dev server |
| `client/` | `npm run build` | Production build into `client/dist` |
| `client/` | `npm run lint` | Run ESLint |
