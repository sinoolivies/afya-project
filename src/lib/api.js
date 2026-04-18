import { APP_CONFIG } from './config'

const AUTH_STORAGE_KEY = 'afyacare-auth'

export function getStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredAuth(auth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function request(path, options = {}) {
  const auth = getStoredAuth()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`
  }

  const response = await fetch(`${APP_CONFIG.nodeApiUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Request failed.')
  }

  return response.json()
}

export async function sendChatMessage(payload) {
  const response = await fetch(`${APP_CONFIG.aiServiceUrl}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Unable to reach the healthcare assistant right now.')
  }

  return response.json()
}

export async function loginStaff(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function registerHospital(payload) {
  return request('/auth/register-admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchCurrentUser() {
  return request('/auth/me')
}

export async function fetchHospitals(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/hospitals${suffix}`)
}

export async function updateHospital(hospitalId, payload) {
  return request(`/hospitals/${hospitalId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function fetchAppointments() {
  return request('/appointments')
}

export async function fetchAppointmentStats() {
  return request('/appointments/stats/overview')
}

export async function updateAppointmentStatus(appointmentId, payload) {
  return request(`/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function fetchDoctors(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/doctors${suffix}`)
}

export async function fetchDoctorSlots(doctorId, date) {
  const query = new URLSearchParams()
  if (date) {
    query.append('date', date)
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/doctors/${doctorId}/slots${suffix}`)
}

export async function createManualAppointment(payload) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createDoctor(payload) {
  return request('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchAvailability(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/availability${suffix}`)
}

export async function createAvailability(payload) {
  return request('/availability', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAvailability(availabilityId, payload) {
  return request(`/availability/${availabilityId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteAvailability(availabilityId) {
  return request(`/availability/${availabilityId}`, {
    method: 'DELETE',
  })
}
