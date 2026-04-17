# MediAssist Backend API

Production-grade REST API for the MediAssist Healthcare SaaS platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Doctor, Patient)
- **User Management**: Complete user CRUD operations with password hashing
- **Appointment System**: Create, manage, and track appointments with status workflows
- **Doctor Management**: Manage medical staff, specialties, and availability
- **Hospital Directory**: Hospital and clinic listings with geospatial support
- **RESTful API Design**: Clean, consistent API following REST best practices
- **Error Handling**: Centralized error handling with meaningful responses
- **Security**: bcrypt password hashing, JWT tokens, CORS protection
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mediassist
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Make sure MongoDB is running:**
   ```bash
   # Using Homebrew (macOS)
   brew services start mongodb-community

   # Using systemctl (Linux)
   sudo systemctl start mongod

   # Or run directly
   mongod
   ```

6. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Dr. John Doe",
  "email": "john@hospital.com",
  "password": "password123",
  "role": "doctor",
  "hospital": "City General Hospital",
  "specialty": "Cardiologist",
  "experience": "10 years",
  "phone": "(555) 123-4567"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "Admin User",
    "email": "admin@hospital.com",
    "role": "admin",
    "hospital": "City General Hospital"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/v1/auth/updateprofile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phone": "(555) 999-9999"
}
```

#### Update Password
```http
PUT /api/v1/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Appointment Endpoints

#### Get All Appointments (Admin/Doctor)
```http
GET /api/v1/appointments
Authorization: Bearer <token>

# Filter by status
GET /api/v1/appointments?status=pending
```

#### Get Single Appointment
```http
GET /api/v1/appointments/:id
Authorization: Bearer <token>
```

#### Create Appointment (Public)
```http
POST /api/v1/appointments
Content-Type: application/json

{
  "patient": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "(555) 987-6543"
  },
  "doctor": "Dr. Sarah Johnson",
  "doctorId": "507f1f77bcf86cd799439011",
  "hospital": "City General Hospital",
  "date": "2026-04-25",
  "time": "10:00 AM",
  "symptoms": "Chest pain and shortness of breath",
  "aiGenerated": true
}
```

#### Update Appointment Status (Admin)
```http
PATCH /api/v1/appointments/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",
  "notes": "Appointment confirmed"
}
```

#### Get Appointment Statistics (Admin)
```http
GET /api/v1/appointments/stats/overview
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "data": {
    "total": 45,
    "pending": 12,
    "approved": 20,
    "rejected": 3,
    "completed": 10,
    "approvedToday": 5
  }
}
```

### Doctor Endpoints

#### Get All Doctors (Public)
```http
GET /api/v1/doctors
```

#### Get Single Doctor (Public)
```http
GET /api/v1/doctors/:id
```

#### Get Doctors by Hospital (Public)
```http
GET /api/v1/doctors/hospital/City%20General%20Hospital
```

#### Create Doctor (Admin)
```http
POST /api/v1/doctors
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "Dr. Jane Smith",
  "email": "jane@hospital.com",
  "password": "password123",
  "hospital": "City General Hospital",
  "specialty": "Pediatrician",
  "experience": "8 years",
  "phone": "(555) 111-2222"
}
```

#### Update Doctor (Admin)
```http
PUT /api/v1/doctors/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "on-leave"
}
```

#### Delete Doctor (Admin)
```http
DELETE /api/v1/doctors/:id
Authorization: Bearer <admin-token>
```

#### Get Doctor Statistics (Admin)
```http
GET /api/v1/doctors/stats/overview
Authorization: Bearer <admin-token>
```

### Hospital Endpoints

#### Get All Hospitals (Public)
```http
GET /api/v1/hospitals

# Filter by type
GET /api/v1/hospitals?type=clinic

# Filter by verified status
GET /api/v1/hospitals?verified=true
```

#### Get Single Hospital (Public)
```http
GET /api/v1/hospitals/:id
```

#### Create Hospital (Admin)
```http
POST /api/v1/hospitals
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Medical Center",
  "type": "hospital",
  "address": {
    "street": "123 Medical Drive",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "fullAddress": "123 Medical Drive, New York, NY 10001"
  },
  "phone": "(555) 888-9999",
  "emergency": true,
  "departments": ["Emergency", "Surgery"],
  "rating": 4.5
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Patient**: Can create appointments
- **Doctor**: Can view and manage their appointments
- **Admin**: Full access to manage appointments, doctors, and hospitals

## 📊 Database Models

### User Model
- fullName
- email (unique)
- password (hashed)
- role (patient, doctor, admin)
- hospital
- phone
- specialty (doctors only)
- experience (doctors only)
- status (active, on-leave, inactive)

### Appointment Model
- patient (name, email, phone)
- doctor
- doctorId (reference)
- hospital
- date
- time
- symptoms
- status (pending, approved, rejected, completed, cancelled)
- aiGenerated (boolean)
- notes

### Hospital Model
- name
- type (hospital, clinic, urgent-care)
- address
- location (geospatial)
- phone
- rating
- emergency (boolean)
- departments
- services
- verified (boolean)

## 🧪 Testing

### Demo Credentials
After running the seed script, use these credentials:

**Admin Account:**
- Email: `admin@hospital.com`
- Password: `admin123`

**Doctor Account:**
- Email: `doctor@hospital.com`
- Password: `doctor123`

### Test the API

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hospital.com","password":"admin123"}'
   ```

3. **Get Appointments:**
   ```bash
   curl http://localhost:5000/api/v1/appointments \
     -H "Authorization: Bearer <your-token>"
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── appointmentController.js
│   │   ├── doctorController.js
│   │   └── hospitalController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & authorization
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── Hospital.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── hospitalRoutes.js
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── utils/
│   │   └── generateToken.js     # JWT token generation
│   └── server.js                # Express app & server
├── .env.example
├── package.json
└── README.md
```

## 🚀 Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Seed database with sample data
npm run seed
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mediassist |
| JWT_SECRET | Secret key for JWT signing | - |
| JWT_EXPIRE | JWT token expiration | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- CORS protection
- Input validation
- MongoDB injection protection

## 📝 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## 🤝 Contributing

1. Follow RESTful API design principles
2. Add proper error handling
3. Include JSDoc comments
4. Test all endpoints before committing
5. Update this README if adding new endpoints

## 📄 License

MIT

## 🆘 Support

For issues and questions, please contact the MediAssist development team.

---

Built with ❤️ by the MediAssist Team
