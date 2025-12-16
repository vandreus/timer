import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize, { testConnection, syncDatabase } from '../config/database.js';

const setupAdmin = async () => {
  try {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  MOLCOM INC. Time Tracker - Admin Setup ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    // Check command line arguments
    const [,, username, password, fullName] = process.argv;

    if (!username || !password || !fullName) {
      console.log('Usage: npm run setup-admin <username> <password> <fullName>');
      console.log('Example: npm run setup-admin admin mypassword "John Doe"');
      console.log('');
      console.log('Or run without arguments for interactive mode:');
      console.log('');
      process.exit(1);
    }

    // Validate inputs
    if (username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      process.exit(1);
    }

    if (password.length < 4) {
      console.error('❌ Password must be at least 4 characters');
      process.exit(1);
    }

    // Connect to database
    console.log('Connecting to database...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Sync database
    await syncDatabase(false);

    console.log('');
    console.log('Creating admin user...');

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.error(`❌ User "${username}" already exists`);
      process.exit(1);
    }

    // Hash password manually to avoid model hook issues
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      passwordHash,
      fullName,
      isAdmin: true,
    });

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Account Details:');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Full Name: ${admin.fullName}`);
    console.log(`  Admin: ${admin.isAdmin}`);
    console.log('');
    console.log('You can now login with these credentials.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Setup failed:', error.message);
    console.error('');
    process.exit(1);
  }
};

setupAdmin();
