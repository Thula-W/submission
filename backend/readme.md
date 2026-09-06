# Full-Stack Application - Backend API

A RESTful API built with Node.js, Express.js, TypeScript, PostgreSQL, and Prisma. The service features JWT-based role authentication (`CUSTOMER` and `ADMIN`), customer form submissions, and administrative management capabilities with filtering and search.

---

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validation:** Zod
* **Security & Auth:** JWT (JSON Web Tokens), Bcrypt, Cookie-Parser

---

## Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma      
│   └── seed.ts          
├── src/
│   ├── config/            
│   ├── controllers/        
│   │   ├── auth.controller.ts
│   │   └── submission.controller.ts
│   ├── middleware/         
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/              
│   │   ├── auth.routes.ts
│   │   └── submission.routes.ts
│   ├── schemas/             
│   │   ├── auth.schema.ts
│   │   └── submission.schema.ts
│   ├── utils/               
│   │   └── token.ts
│   ├── app.ts               
│   └── server.ts            
├── .env.example             
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* PostgreSQL running locally or via a cloud instance

### 1. Installation

Clone the repository and install all dependencies:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root of the `backend` folder:

Define the required variables:


### 3. Database Migration & Seeding

Apply migrations to initialize your PostgreSQL schema:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma Client types:

```bash
npx prisma generate
```

Seed the database with the initial Super Admin, customer and 5 submissions:

```bash
npm run  seed
```

* **Default Admin Email:** `dmin@example.com`
* **Default Admin Password:** `pass123`

* **Default Customer Email:** `customer@example.com`
* **Default Customer Password:** `customer123`
  
### 4. Running the Server

* **Development Mode (Hot-reload):**
  ```bash
  npm run dev
  ```
* **Production Build & Execution:**
  ```bash
  npm run build
  npm start
  ```

---

## API Endpoints Reference

### Health Check

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Heartbeat verification check |

---

### Authentication Endpoints (`/api/auth`)

#### 1. Customer Registration
* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Access:** Public
* **Validation Requirements:**
  * `email`: Valid email format, required, must be unique.
  * `password`: Required, minimum 4 characters.
  * `confirmPassword`: Required, must match `password`.
* **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "message": "Customer registered successfully",
    "customer": {
      "id": "c1f7b0a2-1234-4b5c-89de-0123456789ab",
      "email": "customer@example.com",
      "createdAt": "2026-03-01T10:00:00.000Z"
    }
  }
  ```
* **Error Response (`400 Bad Request` - Validation Failure):**
  ```json
  {
    "status": "error",
    "errors": [
      {
        "field": "confirmPassword",
        "message": "Passwords do not match"
      }
    ]
  }
  ```
* **Error Response (`409 Conflict` - Duplicate Email):**
  ```json
  {
    "message": "Email is already registered"
  }
  ```

#### 2. Customer Login
* **Method:** `POST`
* **Endpoint:** `/api/auth/login/customer`
* **Access:** Public (Restricted to `CUSTOMER` role)
* **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "password123"
  }
  ```
* **Response (`200 OK`):**
  * Sets an `httpOnly` cookie named `refreshToken`.
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "c1f7b0a2-1234-4b5c-89de-0123456789ab",
      "email": "customer@example.com",
      "role": "CUSTOMER"
    }
  }
  ```
* **Error Response (`401 Unauthorized`):**
  ```json
  {
    "message": "Invalid credentials or unauthorized role"
  }
  ```

#### 3. Admin Login
* **Method:** `POST`
* **Endpoint:** `/api/auth/login/admin`
* **Access:** Public (Restricted to `ADMIN` role)
* **Request Body:**
  ```json
  {
    "email": "superadmin@example.com",
    "password": "AdminPassword123!"
  }
  ```
* **Response (`200 OK`):**
  * Sets an `httpOnly` cookie named `refreshToken`.
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "a9e8d7c6-5432-4a1b-87cf-9876543210fe",
      "email": "superadmin@example.com",
      "role": "ADMIN",
      "isSuperAdmin": true
    }
  }
  ```
* **Error Response (`401 Unauthorized`):**
  ```json
  {
    "message": "Invalid credentials or unauthorized role"
  }
  ```

#### 4. Refresh Token
* **Method:** `POST`
* **Endpoint:** `/api/auth/refresh`
* **Access:** Public (Reads `refreshToken` cookie or request body)

* **Response (`200 OK`):**
  ```json
  {
    "accessToken": "eyJhbGciOi..."
  }
  ```
* **Error Response (`401 / 403`):**
  ```json
  {
    "message": "Invalid or expired refresh token"
  }
  ```

#### 5. User Logout
* **Method:** `POST`
* **Endpoint:** `/api/auth/logout`
* **Access:** Public
* **Response (`200 OK`):**
  * Clears the `refreshToken` cookie.
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### 6. Create Admin Account
* **Method:** `POST`
* **Endpoint:** `/api/auth/admin`
* **Access:** Protected (Requires `ADMIN` role)
* **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
* **Request Body:**
  ```json
  {
    "email": "newadmin@example.com"
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "message": "Admin account created successfully",
    "admin": {
      "id": "e4d3c2b1-9876-4f5e-99cb-112233445566",
      "email": "newadmin@example.com",
      "isSuperAdmin": false,
      "createdAt": "2026-03-01T10:15:00.000Z"
    },
    "temporaryPassword": "xK9#mQ2$pL8v"
  }
  ```
* **Error Response (`403 Forbidden` - Calling with customer token):**
  ```json
  {
    "message": "Forbidden: Insufficient permissions"
  }
  ```

---

### Form Submissions Endpoints (`/api/submissions`)

#### 1. Submit Form
* **Method:** `POST`
* **Endpoint:** `/api/submissions`
* **Access:** Protected (Requires `CUSTOMER` role)
* **Headers:** `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`
* **Validation Requirements:**
  * `firstName`: Non-empty string.
  * `lastName`: Non-empty string.
  * `email`: Valid email format, unique per submission.
  * `gender`: Must be `MALE`, `FEMALE`, or `OTHER`.
  * `mobileNumber`: Valid mobile number. (Either 10 digits starting with 0 (e.g., 0712345678) or 11 digits starting with + (e.g., +94712345678))
  * `address`: Non-empty string.
  * `feedback`: Optional string.
* **Request Body:**
  ```json
  {
    "firstName": "Kamal",
    "lastName": "Perera",
    "email": "kamal.perera@example.com",
    "gender": "MALE",
    "mobileNumber": "+94771234567",
    "address": "123 Galle Road, Colombo 03",
    "feedback": "Prompt and smooth service."
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "message": "Form submitted successfully",
    "submission": {
      "id": "f8a7b6c5-2345-4c6d-88fe-998877665544",
      "firstName": "Kamal",
      "lastName": "Perera",
      "email": "kamal.perera@example.com",
      "gender": "MALE",
      "status": "PENDING",
      "mobileNumber": "+94771234567",
      "address": "123 Galle Road, Colombo 03",
      "feedback": "Prompt and smooth service.",
      "customerCreatedId": "c1f7b0a2-1234-4b5c-89de-0123456789ab",
      "dateCreated": "2026-03-01T10:30:00.000Z",
      "adminModifiedId": null,
      "dateModified": null
    }
  }
  ```
* **Error Response (`409 Conflict` - Duplicate submission email):**
  ```json
  {
    "message": "A submission with this email address already exists"
  }
  ```

#### 2. Get All Submissions (with Filters and Search)
* **Method:** `GET`
* **Endpoint:** `/api/submissions`
* **Access:** Protected (Requires `ADMIN` role)
* **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
* **Query Parameters:**
  * `gender` *(optional)*: Filter by `MALE`, `FEMALE`, or `OTHER`.
  * `search` *(optional)*: Case-insensitive partial text match against `firstName` or `lastName`.
* **Example URL:**
  ```http
  GET /api/submissions?gender=MALE&search=kam
  ```
* **Response (`200 OK`):**
  ```json
  {
    "submissions": [
      {
        "id": "f8a7b6c5-2345-4c6d-88fe-998877665544",
        "firstName": "Kamal",
        "lastName": "Perera",
        "email": "kamal.perera@example.com",
        "gender": "MALE",
        "status": "PENDING",
        "mobileNumber": "+94771234567",
        "address": "123 Galle Road, Colombo 03",
        "feedback": "Prompt and smooth service.",
        "customerCreatedId": "c1f7b0a2-1234-4b5c-89de-0123456789ab",
        "dateCreated": "2026-03-01T10:30:00.000Z",
        "adminModifiedId": null,
        "dateModified": null,
        "customerCreated": {
          "id": "c1f7b0a2-1234-4b5c-89de-0123456789ab",
          "email": "customer@example.com"
        },
        "adminModified": null
      }
    ]
  }
  ```

#### 3. Update Submission
* **Method:** `PUT`
* **Endpoint:** `/api/submissions/:id`
* **Access:** Protected (Requires `ADMIN` role)
* **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
* **Request Body (All fields optional):**
  ```json
  {
    "status": "REVIEWED",
    "feedback": "Submission verified by verification officer."
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "message": "Submission updated successfully",
    "submission": {
      "id": "f8a7b6c5-2345-4c6d-88fe-998877665544",
      "firstName": "Kamal",
      "lastName": "Perera",
      "email": "kamal.perera@example.com",
      "gender": "MALE",
      "status": "REVIEWED",
      "mobileNumber": "+94771234567",
      "address": "123 Galle Road, Colombo 03",
      "feedback": "Submission verified by verification officer.",
      "customerCreatedId": "c1f7b0a2-1234-4b5c-89de-0123456789ab",
      "dateCreated": "2026-03-01T10:30:00.000Z",
      "adminModifiedId": "a9e8d7c6-5432-4a1b-87cf-9876543210fe",
      "dateModified": "2026-03-01T11:00:00.000Z"
    }
  }
  ```
* **Error Response (`404 Not Found`):**
  ```json
  {
    "message": "Submission not found"
  }
  ```

#### 4. Delete Submission
* **Method:** `DELETE`
* **Endpoint:** `/api/submissions/:id`
* **Access:** Protected (Requires `ADMIN` role)
* **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
* **Response (`200 OK`):**
  ```json
  {
    "message": "Submission deleted successfully"
  }
  ```
* **Error Response (`404 Not Found`):**
  ```json
  {
    "message": "Submission not found"
  }
  ```