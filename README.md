# MediCare Connect — Server

REST API backend for the MediCare Connect healthcare platform. Built with Express.js and MongoDB, it handles authentication, doctor management, appointment booking, Stripe payments, and role-based access control for patients, doctors, and admins.

**Live API:** [medicare-server-457k.onrender.com](https://medicare-server-457k.onrender.com)

---

## Overview

This server powers the [MediCare Connect client](../medicare-client/) — a full-stack telehealth application. It exposes a RESTful API secured with JWT tokens, integrates Google OAuth via Better Auth, and processes appointment payments through Stripe Checkout.

The API follows a modular architecture with separate routes, controllers, middleware, and MongoDB collection helpers.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | [Express 5](https://expressjs.com/) |
| Database | [MongoDB](https://www.mongodb.com/) (native driver) |
| Authentication | JWT + [Better Auth](https://www.better-auth.com/) |
| OAuth | Google Sign-In (Better Auth social provider) |
| Payments | [Stripe](https://stripe.com/) Checkout |
| Security | bcryptjs, CORS, cookie-parser |
| Deployment | [Render](https://render.com/) |

---

## Features

### Authentication (`/api/auth`)
- User registration and login with hashed passwords
- Google OAuth via Better Auth (cross-origin cookie handling)
- JWT token generation for API access
- Google session exchange endpoint (`POST /api/auth/google`)

### Users (`/api/users`) — Admin
- List all platform users
- Activate / suspend user accounts
- Delete users
- Platform analytics dashboard data

### Doctors (`/api/doctors`)
- Public doctor listing with search, sort, and pagination
- Doctor profile and schedule management
- Doctor application submission
- Admin verification workflow (approve / reject doctors)

### Appointments (`/api/appointments`)
- Patient booking, rescheduling, and cancellation
- Doctor accept / reject / complete workflow
- Prescription management
- Admin view of all appointments

### Payments (`/api/payments`)
- Stripe Checkout session creation
- Payment success callback handling
- Patient payment history
- Admin payment records

### Reviews (`/api/reviews`)
- Public review listing (homepage and doctor profiles)
- Patient create, update, and delete reviews

### Home (`/api/home`)
- Public homepage statistics (doctors, patients, appointments)

### Health (`/api/health`)
- Server health check endpoint

---

## Project Structure

```
medicare-server/
├── collections/           # MongoDB collection accessors
│   ├── usersCollection.js
│   ├── doctorsCollection.js
│   ├── appointmentsCollection.js
│   ├── paymentsCollection.js
│   └── reviewsCollection.js
├── config/
│   └── db.js              # MongoDB connection
├── controllers/           # Route business logic
├── middleware/
│   ├── verifyToken.js     # JWT validation
│   ├── verifyAdmin.js
│   ├── verifyDoctor.js
│   └── verifyPatient.js
├── routes/                # Express route definitions
├── utils/
│   └── generateToken.js
├── auth.js                # Better Auth configuration
├── index.js               # App entry point
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB instance)
- Stripe account (for payments)
- Google Cloud OAuth credentials (for Google sign-in)

### Installation

```bash
# Navigate to the server folder
cd medicare-server

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5001
SERVER_URL=http://localhost:5001
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medicareDB

# JWT
JWT_SECRET=your_jwt_secret_key

# Better Auth
BETTER_AUTH_URL=http://localhost:5001
BETTER_AUTH_SECRET=your_better_auth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5001`) |
| `SERVER_URL` | Public URL of this API |
| `CLIENT_URL` | Frontend URL (used for CORS and redirects) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `BETTER_AUTH_URL` | Base URL for Better Auth (same as `SERVER_URL` in production) |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `STRIPE_SECRET_KEY` | Stripe secret API key |

### Run Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:5001`. Visit `http://localhost:5001/ping` to verify it is running.

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new patient |
| POST | `/api/auth/login` | Public | Login with email/password |
| POST | `/api/auth/google` | Public | Exchange Google session for JWT |
| * | `/api/auth/*` | Public | Better Auth handlers (OAuth, session) |

### Doctors
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/doctors` | Public | List doctors (search, sort, paginate) |
| GET | `/api/doctors/:id` | Public | Get doctor by ID |
| POST | `/api/doctors/apply` | Patient | Submit doctor application |
| GET | `/api/doctors/profile/me` | Doctor | Get own profile |
| PATCH | `/api/doctors/profile/me` | Doctor | Update own profile |
| PATCH | `/api/doctors/:id/schedule` | Doctor | Update availability schedule |
| GET | `/api/doctors/admin/all` | Admin | List all doctor applications |
| PATCH | `/api/doctors/admin/:id/status` | Admin | Verify or reject doctor |

### Appointments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/appointments` | Patient | Book an appointment |
| GET | `/api/appointments/patient/my-appointments` | Patient | Get own appointments |
| PATCH | `/api/appointments/:id` | Patient | Reschedule or cancel |
| GET | `/api/appointments/doctor/requests` | Doctor | Get appointment requests |
| PATCH | `/api/appointments/doctor/:id/status` | Doctor | Accept, reject, or complete |
| PATCH | `/api/appointments/doctor/:id/prescription` | Doctor | Add prescription |
| GET | `/api/appointments/admin/all` | Admin | List all appointments |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/create-checkout-session` | Patient | Create Stripe Checkout session |
| GET | `/api/payments/checkout-success` | Public | Stripe success callback |
| GET | `/api/payments/patient/history` | Patient | Payment history |
| GET | `/api/payments/admin/all` | Admin | All payment records |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reviews/all` | Public | All reviews (homepage) |
| GET | `/api/reviews/doctor/:doctorId` | Public | Reviews for a doctor |
| POST | `/api/reviews` | Patient | Submit a review |
| GET | `/api/reviews/patient/my-reviews` | Patient | Own reviews |
| PATCH | `/api/reviews/:id` | Patient | Update a review |
| DELETE | `/api/reviews/:id` | Patient | Delete a review |

### Users (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/admin/analytics` | Admin | Platform analytics |
| PATCH | `/api/users/:id/status` | Admin | Update user status |
| DELETE | `/api/users/:id` | Admin | Delete a user |

---

## Authentication & Authorization

### JWT Flow
1. User registers or logs in → server returns a signed JWT.
2. Client sends `Authorization: Bearer <token>` on protected requests.
3. `verifyToken` middleware decodes the token and attaches `req.user`.
4. Role middleware (`verifyAdmin`, `verifyDoctor`, `verifyPatient`) checks database role.

### Google OAuth Flow
1. Client calls Better Auth `signIn.social({ provider: "google" })`.
2. User authenticates with Google → callback hits `/api/auth/callback/google`.
3. Client receives redirect with `?google_success=true`.
4. Client calls `POST /api/auth/google` to exchange the session for a JWT.

### Role-Based Access

| Role | Permissions |
|------|-------------|
| `patient` | Book appointments, pay, review doctors |
| `doctor` | Manage schedule, accept/reject requests, write prescriptions |
| `admin` | Manage users, verify doctors, view all data |

---

## Appointment Lifecycle

```
Pending → Approved → Paid → Completed
              ↓
           Rejected
              ↓
          Cancelled (by patient)
```

1. **Patient** books → status: `Pending`
2. **Doctor** accepts → status: `Approved`
3. **Patient** pays via Stripe → status: `Paid`
4. **Doctor** adds prescription → status: `Completed`

---

## Deployment (Render)

1. Push the repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Set build command: `npm install` and start command: `npm start`.
4. Add all environment variables from the table above.
5. Set `SERVER_URL` and `BETTER_AUTH_URL` to your Render URL (e.g. `https://medicare-server-457k.onrender.com`).
6. Set `CLIENT_URL` to your Vercel frontend URL.
7. In Google Cloud Console, add the callback URL:
   ```
   https://your-server.onrender.com/api/auth/callback/google
   ```

> **CORS:** The server allows requests from the Vercel client origin and supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS` methods with credentials.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |

---

## Related Repository

- **Frontend Client:** [medicare-client](../medicare-client/) — Next.js web application

---

## License

This project was built as part of **Programming Hero Assignment 10**.
