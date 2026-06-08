# Paytm Clone — A Practice Project

A basic, end-to-end clone of a Paytm-style wallet app: sign up, get a randomly
seeded balance, find other users, and transfer money between accounts.

> **Why this exists:** this is a **learning / practice project** . It was built to get hands-on with the MERN stack, JWT authentication,
> schema validation, and — the main thing I wanted to practice here — **atomic
> money transfers using MongoDB transactions/sessions**. The scope is
> deliberately small and the code favours clarity over completeness, so several
> things are simplified on purpose (see [Learning scope](#learning-scope--known-simplifications)).

---

## Tech stack

**Backend**
- **Node.js + Express 4** — REST API
- **MongoDB + Mongoose 8** — data layer (User & Account models)
- **jsonwebtoken** — stateless JWT auth
- **zod** — request body validation
- **dotenv** — config/secrets from environment
- **cors** — cross-origin requests from the Vite dev server

**Frontend**
- **React 18 + Vite 5** — SPA + dev tooling
- **react-router-dom 7** — client-side routing
- **Jotai** — lightweight atom-based state (form state)
- **axios** — HTTP client
- **Tailwind CSS 4** — styling

**Infra (for local transactions)**
- **Docker** — a single-node MongoDB **replica set** (`mongo:4.4.7`), required so
  that multi-document transactions work locally.

---

## Architecture

```
frontend (React + Vite)                backend (Express)              MongoDB
─────────────────────────              ──────────────────             ───────────
Signup / Signin pages   ──HTTP/axios─▶ /api/v1/user/*      ──────────▶ users
Dashboard (balance,                    /api/v1/account/*               accounts
  user list, send)      ◀─JWT token──  (JWT-protected)
SendMoney page          ──transfer───▶ /api/v1/account/transfer ─────▶ atomic txn
```

The Express app mounts a root router at `/api/v1`, which delegates to a `user`
router and an `account` router. Protected routes sit behind an auth middleware
that verifies the `Authorization: Bearer <token>` header.

---

## Core logic

### Authentication (JWT)
- **Signup** validates the body with a Zod schema, rejects duplicate usernames,
  creates a `User` **and** an `Account` seeded with a random starting balance
  (`Math.floor(Math.random() * 10000 + 1)`), then signs and returns a JWT.
- **Signin** verifies credentials and returns a JWT.
- The **auth middleware** parses the `Bearer` token, verifies it against
  `JWT_SECRET`, and attaches `req.userId` for downstream handlers. The secret is
  read from the environment, never hardcoded.

### Validation
All user input (signup, signin, profile update) is parsed with **Zod** schemas
(`safeParse`), so handlers only ever work with well-formed data.

### Money transfer with sessions / transactions ⭐
This is the part the project is really about. A transfer must move money out of
one account and into another as a **single all-or-nothing operation** — you can
never debit the sender without crediting the receiver (or vice versa). To
guarantee that, `POST /api/v1/account/transfer` uses a **Mongoose session and a
MongoDB transaction**:

```js
const session = await mongoose.startSession();
session.startTransaction();

// all reads/writes are bound to the session:
const account   = await Account.findOne({ userId: req.userId }).session(session);
const toaccount = await Account.findOne({ userId: to }).session(session);

await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
await Account.updateOne({ userId: to },        { $inc: { balance:  amount } }).session(session);

await session.commitTransaction();
```

Both balance updates are part of one transaction, so they **commit together or
not at all** — there's no window where money has left one account but not
arrived in the other.

> ℹ️ **Why the Dockerfile exists:** MongoDB only supports multi-document
> transactions on a **replica set**, not a standalone server. The included
> `Dockerfile` spins up a single-node replica set (`--replSet rs` + `rs.initiate()`)
> so transactions work in local development. (A managed cluster like MongoDB Atlas
> already runs as a replica set, so it works there out of the box.)

---

## API reference

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint            | Auth | Description                                              |
|--------|---------------------|------|----------------------------------------------------------|
| POST   | `/user/signup`      | —    | Create user + account, returns a JWT                     |
| POST   | `/user/signin`      | —    | Authenticate, returns a JWT                              |
| PUT    | `/user`             | ✅   | Update first/last name or password                       |
| GET    | `/user/bulk?filter=`| ✅   | Search users by first/last name (regex)                  |
| GET    | `/account/balance`  | ✅   | Get the logged-in user's balance                         |
| POST   | `/account/transfer` | ✅   | Transfer money to another user (atomic, session-based)   |

✅ = requires `Authorization: Bearer <token>`

---

## Learning scope & known simplifications

Because this is a practice project, a few things are intentionally kept simple
and are **not** production-ready:

- **Passwords are stored and compared as plain text** — fine for a sandbox, but a
  real app must hash them (e.g. bcrypt).
- **No global error handling / try–catch** around every async route, and the
  transfer handler's rollback path is minimal.
- **JWTs never expire** and there's no refresh-token flow.
- **No rate limiting, pagination, or logging.**
- Secrets live in `.env` files (git-ignored); never commit real credentials.

These are deliberate trade-offs to keep the focus on the core concepts:
the request → validate → authenticate → **transact** flow.
