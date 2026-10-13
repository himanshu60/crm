# TODO

Deadline: **14 Oct, 5 PM**. Submit at https://forms.gle/QuwjEmPHQVZNsToq6

Rule: write one file, then run `npm run lint` in `server/` and get zero errors before you start the next file.

## Phase A: Setup
- [x] Root `.gitignore` (node_modules, .env)
- [x] `server/package.json` with scripts `dev`, `start`, `lint`
- [x] Install dependencies: express, mongoose, jsonwebtoken, bcryptjs, dotenv, cors, validator
- [x] Install dev dependencies: nodemon, eslint, @eslint/js, globals
- [x] `eslint.config.js` (flat config, Node globals, CommonJS)
- [x] `.env.example` and `.env` (local MongoDB for now)
- [x] Create the folder structure and empty source files
- [ ] Create a MongoDB Atlas cluster, then put its connection string in `.env` as `MONGO_URI`
- [x] `git init` and push to https://github.com/himanshu60/crm

## Phase B: Server skeleton
- [x] `src/config/db.js`: connect with `MONGO_URI`
- [x] `src/app.js`: express app, `cors()`, `express.json()`, `GET /api/health`
- [x] `server.js`: load dotenv, check the required env values, connect the DB, then `app.listen`
- [x] Run the server and see "MongoDB connected"

## Phase C: Auth
- [x] `src/models/Employee.js` (password has `select: false`)
- [x] `src/controllers/auth.controller.js`: `register` (hashes the password; a duplicate email gets 409 from the unique index), `login` (same 401 message for an unknown email and a wrong password)
- [x] `src/routes/auth.routes.js`, mounted at `/api/auth`
- [x] `src/middleware/auth.js`: `employeeAuth` verifies the Bearer token and sets `req.user`

## Phase D: Enquiries
- [x] `src/models/Enquiry.js` (`claimedBy: null` means public; index on `claimedBy` + `createdAt`)
- [x] `POST /api/enquiries/public` (no auth). Only reads the form fields; `claimedBy` from the client is ignored.
- [x] `GET /api/enquiries/public` (auth): list where `claimedBy: null`
- [x] `PATCH /api/enquiries/:id/claim` (auth): atomic `findOneAndUpdate`. Returns 400 for a bad id, 404 if not found, 409 if already claimed.
- [x] `GET /api/enquiries/private` (auth): list where `claimedBy: req.user._id`
- [x] `src/routes/enquiry.routes.js`, mounted at `/api/enquiries`

## Phase E: Polish and submit the backend
- [x] `src/middleware/errorHandler.js`: 404 for unknown routes, plus ValidationError → 400, CastError → 400, duplicate key → 409, bad JSON → 400, everything else → 500
- [x] End-to-end test of every endpoint, including two simultaneous claims (exactly one 200 and one 409)
- [x] Postman collection: `CRM-API.postman_collection.json` (ran it with Newman, all 6 requests pass)
- [x] `README.md` with example requests and responses
- [ ] Switch `MONGO_URI` to Atlas and run `npm run dev` once to confirm it connects
- [x] Commit and push to GitHub
- [ ] (Optional) Deploy on Render with the Atlas URI

### Postman flow to test
1. Register and log in employee A and employee B.
2. POST 2 enquiries **without** a token: expect 201.
3. GET public as A: both leads are listed.
4. Claim lead 1 as A: expect 200. Claim lead 1 as B: expect **409**.
5. GET public as B: only lead 2 is listed.
6. GET private as A: lead 1. GET private as B: empty.
7. Call any protected route without a token: expect **401**.

## Phase F: Bonus React client (only if time is left)
- [x] `npm create vite@latest client -- --template react --eslint`, then `npm i axios react-router-dom`
- [x] `api/axios.js`, `context/AuthContext.js` + `AuthProvider.jsx`, `components/ProtectedRoute.jsx`, `Navbar.jsx`, `LeadsTable.jsx`
- [x] Pages: `EnquiryForm` (public), `Login`, `Register`, `Dashboard` (public leads with a Claim button, plus my leads)
- [x] Test the full flow in the browser (headless Chrome: 24 checks pass)

## Final
- [ ] Submit the GitHub link (and the deployed URL, if there is one) in the Google Form before 14 Oct, 5 PM
