import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';

dotenv.config();

// Sample data
const hospitals = [
  {
    name: 'City General Hospital',
    type: 'hospital',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      fullAddress: '123 Main Street, New York, NY 10001',
    },
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610],
    },
    distance: '2.3 miles',
    rating: 4.8,
    phone: '(555) 123-4567',
    emergency: true,
    departments: ['Emergency', 'Cardiology', 'Neurology', 'Pediatrics'],
    services: ['24/7 Emergency Care', 'Surgery', 'Diagnostics', 'Pharmacy'],
    verified: true,
  },
  {
    name: 'Metro Medical Center',
    type: 'hospital',
    address: {
      street: '456 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      fullAddress: '456 Park Avenue, New York, NY 10002',
    },
    location: {
      type: 'Point',
      coordinates: [-73.985130, 40.758896],
    },
    distance: '3.7 miles',
    rating: 4.6,
    phone: '(555) 234-5678',
    emergency: true,
    departments: ['Emergency', 'Orthopedics', 'Oncology'],
    services: ['Emergency Care', 'Cancer Treatment', 'Rehabilitation'],
    verified: true,
  },
  {
    name: 'Sunrise Health Clinic',
    type: 'clinic',
    address: {
      street: '789 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      fullAddress: '789 Broadway, New York, NY 10003',
    },
    location: {
      type: 'Point',
      coordinates: [-73.989308, 40.742054],
    },
    distance: '1.5 miles',
    rating: 4.7,
    phone: '(555) 345-6789',
    emergency: false,
    departments: ['Primary Care', 'Pediatrics', 'Dermatology'],
    services: ['General Checkups', 'Vaccinations', 'Lab Tests'],
    verified: true,
  },
];

const users = [
  {
    fullName: 'Admin User',
    email: 'admin@hospital.com',
    password: 'admin123',
    role: 'admin',
    hospital: 'City General Hospital',
    phone: '(555) 111-1111',
    status: 'active',
  },
  {
    fullName: 'Dr. Sarah Johnson',
    email: 'sarah.j@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    hospital: 'City General Hospital',
    phone: '(555) 123-4567',
    specialty: 'Cardiologist',
    experience: '15 years',
    patients: 234,
    status: 'active',
  },
  {
    fullName: 'Dr. Michael Chen',
    email: 'doctor@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    hospital: 'City General Hospital',
    phone: '(555) 234-5678',
    specialty: 'Neurologist',
    experience: '12 years',
    patients: 198,
    status: 'active',
  },
  {
    fullName: 'Dr. Emily Rodriguez',
    email: 'emily.r@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    hospital: 'Metro Medical Center',
    phone: '(555) 345-6789',
    specialty: 'Pediatrician',
    experience: '10 years',
    patients: 312,
    status: 'active',
  },
  {
    fullName: 'Dr. James Park',
    email: 'james.p@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    hospital: 'City General Hospital',
    phone: '(555) 456-7890',
    specialty: 'Orthopedic Surgeon',
    experience: '18 years',
    patients: 156,
    status: 'on-leave',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert hospitals
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`✅ ${createdHospitals.length} hospitals created`);

    // Insert users (use create to trigger password hashing)
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} users created`);

    // Create sample appointments
    const doctors = createdUsers.filter((u) => u.role === 'doctor');
    
    const appointments = [
      {
        patient: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(555) 987-6543',
        },
        doctor: doctors[0].fullName,
        doctorId: doctors[0]._id,
        hospital: doctors[0].hospital,
        date: '2026-04-20',
        time: '10:00 AM',
        symptoms: 'Chest pain and shortness of breath',
        status: 'pending',
        aiGenerated: true,
      },
      {
        patient: {
          name: 'Emma Davis',
          email: 'emma.davis@example.com',
          phone: '(555) 876-5432',
        },
        doctor: doctors[1].fullName,
        doctorId: doctors[1]._id,
        hospital: doctors[1].hospital,
        date: '2026-04-21',
        time: '2:00 PM',
        symptoms: 'Severe headaches for the past week',
        status: 'approved',
        aiGenerated: true,
      },
      {
        patient: {
          name: 'Michael Brown',
          email: 'michael.b@example.com',
          phone: '(555) 765-4321',
        },
        doctor: doctors[0].fullName,
        doctorId: doctors[0]._id,
        hospital: doctors[0].hospital,
        date: '2026-04-19',
        time: '11:30 AM',
        symptoms: 'Regular checkup',
        status: 'pending',
        aiGenerated: false,
      },
      {
        patient: {
          name: 'Sarah Wilson',
          email: 'sarah.w@example.com',
          phone: '(555) 654-3210',
        },
        doctor: doctors[2].fullName,
        doctorId: doctors[2]._id,
        hospital: doctors[2].hospital,
        date: '2026-04-22',
        time: '9:00 AM',
        symptoms: 'Child vaccination appointment',
        status: 'approved',
        aiGenerated: false,
      },
      {
        patient: {
          name: 'David Martinez',
          email: 'david.m@example.com',
          phone: '(555) 543-2109',
        },
        doctor: doctors[1].fullName,
        doctorId: doctors[1]._id,
        hospital: doctors[1].hospital,
        date: '2026-04-18',
        time: '3:30 PM',
        symptoms: 'Follow-up consultation',
        status: 'completed',
        aiGenerated: false,
      },
    ];

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`✅ ${createdAppointments.length} appointments created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Admin: admin@hospital.com / admin123');
    console.log('   Doctor: doctor@hospital.com / doctor123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
