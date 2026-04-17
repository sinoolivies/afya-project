# MediAssist API - Request Examples

Complete examples for testing all API endpoints.

## 🔑 Authentication Examples

### 1. Login as Admin

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Admin User",
    "email": "admin@hospital.com",
    "role": "admin",
    "hospital": "City General Hospital",
    "status": "active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login as Doctor

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "doctor123"
  }'
```

### 3. Register New Doctor

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Jane Smith",
    "email": "jane.smith@hospital.com",
    "password": "securepass123",
    "role": "doctor",
    "hospital": "City General Hospital",
    "specialty": "Dermatologist",
    "experience": "8 years",
    "phone": "(555) 123-4567"
  }'
```

### 4. Get Current User Profile

**Request:**
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📅 Appointment Examples

### 1. Create New Appointment (Public - No Auth Required)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "(555) 987-6543"
    },
    "doctor": "Dr. Sarah Johnson",
    "doctorId": "507f1f77bcf86cd799439011",
    "hospital": "City General Hospital",
    "date": "2026-04-25",
    "time": "10:00 AM",
    "symptoms": "Chest pain and shortness of breath",
    "aiGenerated": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "patient": {
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "(555) 987-6543"
    },
    "doctor": "Dr. Sarah Johnson",
    "hospital": "City General Hospital",
    "date": "2026-04-25",
    "time": "10:00 AM",
    "symptoms": "Chest pain and shortness of breath",
    "status": "pending",
    "aiGenerated": true,
    "createdAt": "2026-04-17T10:30:00.000Z"
  }
}
```

### 2. Get All Appointments (Admin/Doctor)

**Request:**
```bash
curl http://localhost:5000/api/v1/appointments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "patient": {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "phone": "(555) 987-6543"
      },
      "doctor": "Dr. Sarah Johnson",
      "hospital": "City General Hospital",
      "date": "2026-04-20",
      "time": "10:00 AM",
      "status": "pending",
      "createdAt": "2026-04-17T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Pending Appointments Only

**Request:**
```bash
curl http://localhost:5000/api/v1/appointments?status=pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Approve Appointment (Admin Only)

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/v1/appointments/507f1f77bcf86cd799439012/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Appointment confirmed for April 25th"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "approved",
    "notes": "Appointment confirmed for April 25th",
    "updatedAt": "2026-04-17T11:00:00.000Z"
  }
}
```

### 5. Reject Appointment (Admin Only)

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/v1/appointments/507f1f77bcf86cd799439012/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Doctor not available on requested date"
  }'
```

### 6. Get Appointment Statistics (Admin Only)

**Request:**
```bash
curl http://localhost:5000/api/v1/appointments/stats/overview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
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

---

## 👨‍⚕️ Doctor Examples

### 1. Get All Doctors (Public)

**Request:**
```bash
curl http://localhost:5000/api/v1/doctors
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.j@hospital.com",
      "role": "doctor",
      "hospital": "City General Hospital",
      "specialty": "Cardiologist",
      "experience": "15 years",
      "phone": "(555) 123-4567",
      "patients": 234,
      "status": "active"
    }
  ]
}
```

### 2. Get Doctors by Hospital (Public)

**Request:**
```bash
curl http://localhost:5000/api/v1/doctors/hospital/City%20General%20Hospital
```

### 3. Get Single Doctor Details (Public)

**Request:**
```bash
curl http://localhost:5000/api/v1/doctors/507f1f77bcf86cd799439013
```

### 4. Create New Doctor (Admin Only)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/doctors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Robert Lee",
    "email": "robert.lee@hospital.com",
    "password": "doctor123",
    "hospital": "City General Hospital",
    "specialty": "Orthopedic Surgeon",
    "experience": "12 years",
    "phone": "(555) 222-3333"
  }'
```

### 5. Update Doctor Status (Admin Only)

**Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/doctors/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "on-leave"
  }'
```

### 6. Get Doctor Statistics (Admin Only)

**Request:**
```bash
curl http://localhost:5000/api/v1/doctors/stats/overview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "active": 4,
    "onLeave": 1,
    "inactive": 0,
    "totalPatients": 1100
  }
}
```

---

## 🏥 Hospital Examples

### 1. Get All Hospitals (Public)

**Request:**
```bash
curl http://localhost:5000/api/v1/hospitals
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "City General Hospital",
      "type": "hospital",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "fullAddress": "123 Main Street, New York, NY 10001"
      },
      "phone": "(555) 123-4567",
      "rating": 4.8,
      "emergency": true,
      "departments": ["Emergency", "Cardiology", "Neurology"],
      "verified": true
    }
  ]
}
```

### 2. Get Hospitals by Type (Public)

**Request:**
```bash
# Get only clinics
curl http://localhost:5000/api/v1/hospitals?type=clinic

# Get only hospitals
curl http://localhost:5000/api/v1/hospitals?type=hospital

# Get urgent care centers
curl http://localhost:5000/api/v1/hospitals?type=urgent-care
```

### 3. Get Verified Hospitals Only (Public)

**Request:**
```bash
curl http://localhost:5000/api/v1/hospitals?verified=true
```

### 4. Create New Hospital (Admin Only)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/hospitals \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Riverside Medical Center",
    "type": "hospital",
    "address": {
      "street": "456 River Road",
      "city": "New York",
      "state": "NY",
      "zipCode": "10002",
      "fullAddress": "456 River Road, New York, NY 10002"
    },
    "phone": "(555) 444-5555",
    "rating": 4.6,
    "emergency": true,
    "departments": ["Emergency", "Surgery", "Pediatrics"],
    "services": ["24/7 Emergency", "Surgery", "Diagnostics"],
    "verified": true
  }'
```

### 5. Update Hospital (Admin Only)

**Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/hospitals/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.9,
    "verified": true
  }'
```

---

## 🧪 Complete Workflow Example

Here's a complete workflow showing how different users interact with the system:

### Step 1: Patient Creates Appointment (No Login)

```bash
curl -X POST http://localhost:5000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "(555) 777-8888"
    },
    "doctor": "Dr. Sarah Johnson",
    "hospital": "City General Hospital",
    "date": "2026-04-25",
    "time": "2:00 PM",
    "symptoms": "Regular checkup",
    "aiGenerated": false
  }'
```

### Step 2: Admin Logs In

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}' \
  | jq -r '.token')
```

### Step 3: Admin Views Pending Appointments

```bash
curl http://localhost:5000/api/v1/appointments?status=pending \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Admin Approves the Appointment

```bash
curl -X PATCH http://localhost:5000/api/v1/appointments/APPOINTMENT_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Confirmed with Dr. Johnson"
  }'
```

### Step 5: Doctor Logs In and Views Their Appointments

```bash
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@hospital.com","password":"doctor123"}' \
  | jq -r '.token')

curl http://localhost:5000/api/v1/appointments?status=approved \
  -H "Authorization: Bearer $DOCTOR_TOKEN"
```

---

## 🔍 Error Handling Examples

### 401 Unauthorized (Missing Token)

**Request:**
```bash
curl http://localhost:5000/api/v1/appointments
```

**Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden (Wrong Role)

**Request:**
```bash
# Doctor trying to access admin-only endpoint
curl http://localhost:5000/api/v1/appointments/stats/overview \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

**Response:**
```json
{
  "success": false,
  "message": "User role 'doctor' is not authorized to access this route"
}
```

### 404 Not Found

**Request:**
```bash
curl http://localhost:5000/api/v1/appointments/invalidid123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 400 Bad Request (Validation Error)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Please provide a valid email, Password must be at least 6 characters"
}
```

---

## 💡 Tips

1. **Save your token**: After login, save the token to use in subsequent requests
2. **Use environment variables**: Store base URL and tokens in env vars
3. **Check response status**: Always check the HTTP status code
4. **Read error messages**: Error messages provide helpful debugging info
5. **Use Postman**: Import the collection for easier testing

---

## 🚀 Next Steps

- Import the Postman collection (`MediAssist-API.postman_collection.json`)
- Test all endpoints systematically
- Integrate with your frontend application
- Build new features on top of this API

---

Built with ❤️ by the MediAssist Team
