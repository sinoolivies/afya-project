import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const verifySetup = async () => {
  log('\n🔍 MediAssist Backend Setup Verification\n', 'cyan');
  log('═'.repeat(50), 'cyan');
  
  let allPassed = true;

  // Check 1: Environment Variables
  log('\n📋 Checking Environment Variables...', 'yellow');
  
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const envChecks = {};
  
  requiredEnvVars.forEach((varName) => {
    const exists = !!process.env[varName];
    envChecks[varName] = exists;
    log(`  ${exists ? '✓' : '✗'} ${varName}`, exists ? 'green' : 'red');
    if (!exists) allPassed = false;
  });

  // Check 2: MongoDB Connection
  log('\n🗄️  Testing MongoDB Connection...', 'yellow');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    log('  ✓ MongoDB connection successful', 'green');
    log(`  ✓ Connected to: ${mongoose.connection.host}`, 'green');

    // Check 3: Collections
    log('\n📊 Checking Database Collections...', 'yellow');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    
    const expectedCollections = ['users', 'appointments', 'hospitals'];
    expectedCollections.forEach((name) => {
      const exists = collectionNames.includes(name);
      log(`  ${exists ? '✓' : '✗'} ${name} collection`, exists ? 'green' : 'yellow');
    });

    if (collectionNames.length === 0) {
      log('  ⚠️  No collections found. Run "npm run seed" to populate database.', 'yellow');
    }

    // Check 4: Sample Data
    log('\n👥 Checking Sample Data...', 'yellow');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Appointment = mongoose.model('Appointment', new mongoose.Schema({}, { strict: false }));
    const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));

    const userCount = await User.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const hospitalCount = await Hospital.countDocuments();

    log(`  ${userCount > 0 ? '✓' : '✗'} Users: ${userCount}`, userCount > 0 ? 'green' : 'yellow');
    log(`  ${appointmentCount > 0 ? '✓' : '✗'} Appointments: ${appointmentCount}`, appointmentCount > 0 ? 'green' : 'yellow');
    log(`  ${hospitalCount > 0 ? '✓' : '✗'} Hospitals: ${hospitalCount}`, hospitalCount > 0 ? 'green' : 'yellow');

    if (userCount === 0 || appointmentCount === 0 || hospitalCount === 0) {
      log('  ⚠️  Missing data. Run "npm run seed" to populate database.', 'yellow');
    }

    await mongoose.connection.close();
    log('  ✓ Database connection closed', 'green');
  } catch (error) {
    log(`  ✗ MongoDB connection failed: ${error.message}`, 'red');
    log('  💡 Make sure MongoDB is running:', 'yellow');
    log('     - macOS: brew services start mongodb-community', 'yellow');
    log('     - Linux: sudo systemctl start mongod', 'yellow');
    log('     - Docker: docker run -d -p 27017:27017 mongo', 'yellow');
    allPassed = false;
  }

  // Summary
  log('\n' + '═'.repeat(50), 'cyan');
  if (allPassed) {
    log('\n✅ All checks passed! Your backend is ready to go!', 'green');
    log('\n🚀 Next steps:', 'cyan');
    log('   1. Run "npm run seed" to populate sample data (if not done)', 'cyan');
    log('   2. Run "npm run dev" to start the development server', 'cyan');
    log('   3. Test the API at http://localhost:5000/health', 'cyan');
  } else {
    log('\n⚠️  Some checks failed. Please review the errors above.', 'yellow');
    log('\n💡 Quick fixes:', 'cyan');
    log('   - Copy .env.example to .env and configure it', 'cyan');
    log('   - Make sure MongoDB is running', 'cyan');
    log('   - Run "npm run seed" to create sample data', 'cyan');
  }
  
  log('\n');
  process.exit(allPassed ? 0 : 1);
};

verifySetup();
