import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import Message from '../models/Message.js';
import { USER_ROLES } from '../constants/roles.js';

dotenv.config();

const DEFAULT_PASSWORD = process.env.DEFAULT_ACCOUNT_PASSWORD || 'pass@123';

const hospitals = [
  {
    name: 'King Faisal Hospital Kigali',
    slug: 'king-faisal-hospital-kigali',
    type: 'hospital',
    contact: { email: 'huguetteuwase84@gmail.com', phone: '+250788000001' },
    address: {
      street: 'KG 544 St',
      city: 'Kigali',
      district: 'Gasabo',
      fullAddress: 'KG 544 St, Kigali, Rwanda',
    },
    location: { type: 'Point', coordinates: [30.0928, -1.9441] },
    departments: ['Cardiology', 'General Medicine', 'Emergency'],
    supportsEmergency: true,
  },
  {
    name: 'CHUK',
    slug: 'chuk',
    type: 'hospital',
    contact: { email: 'shamiguevara1@gmail.com', phone: '+250788000002' },
    address: {
      street: 'KN 4 Ave',
      city: 'Kigali',
      district: 'Nyarugenge',
      fullAddress: 'KN 4 Ave, Kigali, Rwanda',
    },
    location: { type: 'Point', coordinates: [30.0606, -1.9536] },
    departments: ['Neurology', 'General Medicine', 'Pediatrics'],
    supportsEmergency: true,
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([
    Message.deleteMany({}),
    Appointment.deleteMany({}),
    Availability.deleteMany({}),
    Doctor.deleteMany({}),
    User.deleteMany({}),
    Patient.deleteMany({}),
    Hospital.deleteMany({}),
  ]);

  const createdHospitals = await Hospital.insertMany(hospitals);
  const [kfhk, chuk] = createdHospitals;

  const admin = await User.create({
    hospitalId: kfhk._id,
    fullName: 'Huguette Uwase',
    email: 'huguetteuwase84@gmail.com',
    password: DEFAULT_PASSWORD,
    phone: '+250788123000',
    role: USER_ROLES.HOSPITAL_ADMIN,
  });

  const admin2 = await User.create({
    hospitalId: chuk._id,
    fullName: 'Shami Guevara',
    email: 'shamiguevara1@gmail.com',
    password: DEFAULT_PASSWORD,
    phone: '+250788123005',
    role: USER_ROLES.HOSPITAL_ADMIN,
  });

  const doctorUser1 = await User.create({
    hospitalId: kfhk._id,
    fullName: 'Dr. Ruth Marine',
    email: 'ruthmarine7@gmail.com',
    password: DEFAULT_PASSWORD,
    phone: '+250788123001',
    role: USER_ROLES.DOCTOR,
  });

  const doctorUser2 = await User.create({
    hospitalId: chuk._id,
    fullName: 'Dr. Christella Gahongayire',
    email: 'christellagahongayire4@gmail.com',
    password: DEFAULT_PASSWORD,
    phone: '+250788123002',
    role: USER_ROLES.DOCTOR,
  });

  const doctorUser3 = await User.create({
    hospitalId: chuk._id,
    fullName: 'Dr. Ntwari Hertier',
    email: 'ntwarihertier@gmail.com',
    password: DEFAULT_PASSWORD,
    phone: '+250788123003',
    role: USER_ROLES.DOCTOR,
  });

  const doctor1 = await Doctor.create({
    userId: doctorUser1._id,
    hospitalId: kfhk._id,
    specialty: 'Cardiology',
    yearsOfExperience: 8,
    languages: ['English', 'Kinyarwanda', 'French'],
  });

  const doctor2 = await Doctor.create({
    userId: doctorUser2._id,
    hospitalId: chuk._id,
    specialty: 'General Medicine',
    yearsOfExperience: 6,
    languages: ['English', 'Kinyarwanda'],
  });

  const doctor3 = await Doctor.create({
    userId: doctorUser3._id,
    hospitalId: chuk._id,
    specialty: 'Pediatrics',
    yearsOfExperience: 7,
    languages: ['English', 'Kinyarwanda'],
  });

  await Availability.insertMany([
    {
      doctorId: doctor1._id,
      hospitalId: kfhk._id,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '12:00',
      slotDurationMinutes: 30,
    },
    {
      doctorId: doctor1._id,
      hospitalId: kfhk._id,
      dayOfWeek: 2,
      startTime: '13:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
    },
    {
      doctorId: doctor2._id,
      hospitalId: chuk._id,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '15:00',
      slotDurationMinutes: 30,
    },
    {
      doctorId: doctor2._id,
      hospitalId: chuk._id,
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '14:00',
      slotDurationMinutes: 30,
    },
    {
      doctorId: doctor3._id,
      hospitalId: chuk._id,
      dayOfWeek: 1,
      startTime: '10:00',
      endTime: '16:00',
      slotDurationMinutes: 30,
    },
  ]);

  const patient = await Patient.create({
    fullName: 'Jean Claude',
    email: 'jean@example.com',
    phone: '+250788555000',
    location: { type: 'Point', coordinates: [30.0619, -1.9441] },
  });

  await Appointment.create({
    hospitalId: kfhk._id,
    doctorId: doctor1._id,
    patientId: patient._id,
    patientEmail: patient.email,
    source: 'ai',
    reason: 'Chest discomfort consultation',
    symptoms: 'Mild chest pain for two days',
    triage: { urgency: 'medium', notes: 'Needs cardiology follow-up' },
    scheduledFor: new Date('2026-04-20T00:00:00.000Z'),
    slotStart: new Date('2026-04-20T08:00:00.000Z'),
    slotEnd: new Date('2026-04-20T08:30:00.000Z'),
  });

  console.log('Seed complete');
  console.log(`Hospitals: ${createdHospitals.length}`);
  console.log(`Hospital admins: ${admin.email}, ${admin2.email}`);
  console.log(`Default password for all seeded accounts: ${DEFAULT_PASSWORD}`);
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
