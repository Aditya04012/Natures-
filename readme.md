# 🌿 Natures Application — Advanced Node.js Backend API

This is a powerful and production-ready backend API built using **Node.js**, **Express.js**, and **MongoDB**. It follows modular architecture and implements advanced backend features such as JWT authentication, user role-based authorization, error handling, secure data handling, RESTful routing, and MongoDB aggregation.

---

## 🚀 Key Features

### ✅ Authentication & Authorization
- **JWT-based Authentication**
- Password reset, update password (with protect middleware)
- **Role-based Authorization** (admin, user, guide)
- Protected routes using middleware chaining

### 🔐 Security Features
- Rate limiting using `express-rate-limit`
- MongoDB NoSQL Injection Prevention using `express-mongo-sanitize`
- XSS (Cross-Site Scripting) protection via `xss-clean`
- HTTP Parameter Pollution (HPP) protection
- Environment-based error handling (Dev vs Prod)

### 📦 RESTful API with Express Routers
- Clean separation of route modules (`/tours`, `/users`, `/reviews`)
- Middleware like `router.param()` for advanced route handling
- Controller structure for scalability

### 🧠 Advanced MongoDB Queries
- **Filtering** (e.g. `/tours?price[lte]=1000`)
- **Sorting** (e.g. `/tours?sort=-price`)
- **Pagination** (e.g. `/tours?page=2&limit=10`)
- **Field Limiting** (e.g. `/tours?fields=name,price`)
- **Alias Routes** (`/top-5-cheap` via middleware)

### 📊 Aggregation Pipelines
- Tour statistics using `$match`, `$group`, `$sort`
- Monthly plans with `$unwind` and `$project`

### 🧬 Mongoose Features
- **Schema Validation** (custom messages for inputs)
- **Document Middleware** (`pre('save')`, etc.)
- **Query Middleware** (`pre('find')`)
- **Aggregation Middleware**
- **Virtual Populate** and referencing (e.g., user <-> reviews)
- Data modeling using both embedding and referencing

### 💥 Centralized Global Error Handling
- AppError class for operational errors
- Differentiated dev vs production error stacks
- Handlers for:
  - CastError (invalid Mongo IDs)
  - Duplicate field errors
  - Validation errors
  - JWT errors (invalid or expired tokens)

---

## 📁 Project Structure

```bash
natures-app/
│
├── controllers/           # All route logic
│   ├── authControllers.js
│   ├── userControllers.js
│   ├── tourControllers.js
│   └── errorControllers.js
│
├── routes/                # Express route modules
│   ├── userRouter.js
│   ├── tourRoutes.js
│   └── reviewRoutes.js
│
├── models/                # Mongoose schemas
│
├── utils/                 # Custom utilities (AppError, email, etc.)
│
├── app.js                 # Main Express app setup
├── server.js              # Entry point
└── config.env             # Environment configuration
```

---

## 🧪 Example API Routes

### Authentication
- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`
- `PATCH /api/v1/users/resetPassword/:token`
- `PATCH /api/v1/users/updateMyPassword`

### User Management
- `PATCH /api/v1/users/updateMe`
- `DELETE /api/v1/users/deleteMe`
- `GET /api/v1/users/` – Admin-only
- `GET /api/v1/users/:id`

### Tour Routes
- `GET /api/v1/tours/top-5-cheap` – Aliased
- `GET /api/v1/tours/tour-stats` – Aggregation stats
- `GET /api/v1/tours/monthly-plan/:year`
- `POST /api/v1/tours/`, `PATCH`, `DELETE`

---

## 🛡️ Security Middleware Used

| Middleware           | Purpose                                |
|----------------------|-----------------------------------------|
| `express-rate-limit` | Limits requests from a single IP        |
| `express-mongo-sanitize` | Prevents MongoDB injection            |
| `xss-clean`          | Prevents XSS attacks                    |
| `hpp`                | Prevents parameter pollution            |
| `helmet` *(optional)*| Secure headers                          |

---

## 🧠 Advanced Error Handling Logic

- **Dev Mode**: Full error details with stack trace
- **Production Mode**: Only operational errors are exposed to users
- Handles:
  - CastError: Invalid ID
  - Duplicate key errors
  - Validation errors from schema
  - JWT: invalid and expired token handling

---

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/natures-app.git
cd natures-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file with:

```env
PORT=3000
NODE_ENV=development
DATABASE=mongodb://localhost:27017/natures
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_FROM=your-email
EMAIL_PASSWORD=your-password
```

### 4. Start the Server
```bash
npm run dev
```

---

## 🧪 Testing with Postman

Test APIs like:

- `/api/v1/users/login`
- `/api/v1/tours?price[gte]=500&sort=-price`
- `/api/v1/users/updateMyPassword`
- `/api/v1/users/deleteMe`

---

## 📇 Author

👤 **Aditya Bhatnagar**  
📧 [adityabhatnagar0403@gmail.com](mailto:adityabhatnagar0403@gmail.com)  
🔗 [GitHub](https://github.com/Aditya04012)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
