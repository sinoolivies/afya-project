# AfyaCare Node API

Express + MongoDB API for the multi-hospital AfyaCare platform.

## Scope

- Multi-hospital data model with hospital-scoped users, doctors, availability, appointments, patients, and messages
- JWT authentication for hospital admins and doctors
- Internal endpoints for the AI service to find hospitals, doctors, slots, create pending appointments, and trigger notifications
- MongoDB-backed conversation history through the `messages` collection

## Main Collections

- `hospitals`
- `users`
- `doctors`
- `patients`
- `availability`
- `appointments`
- `messages`

## Main Routes

- `POST /api/v1/auth/register-admin`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/hospitals`
- `GET /api/v1/hospitals/nearest/search`
- `GET /api/v1/hospitals/least-busy/search`
- `GET /api/v1/doctors`
- `GET /api/v1/doctors/:id/slots?date=YYYY-MM-DD`
- `GET /api/v1/availability`
- `POST /api/v1/availability`
- `POST /api/v1/patients/upsert`
- `POST /api/v1/appointments`
- `PATCH /api/v1/appointments/:id/status`
- `GET /api/v1/messages/session/:sessionId`
- `POST /api/v1/messages`
- `GET /api/v1/internal/hospitals/nearest`
- `GET /api/v1/internal/hospitals/least-busy`
- `GET /api/v1/internal/doctors`
- `GET /api/v1/internal/doctors/:id/slots`
- `POST /api/v1/internal/appointments/ai-create`
- `POST /api/v1/internal/notifications/email`

## Local Run

1. Fill in `backend/.env`
2. Run `npm install`
3. Run `npm run verify`
4. Run `npm run seed`
5. Run `npm run dev`

## Notes

- AI-created appointments are always persisted with `pending` status.
- The notification service is provider-ready and currently defaults to console logging unless a real provider is added.
