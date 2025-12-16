import readline from 'readline';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize, { testConnection, syncDatabase } from '../config/database.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const setupAdmin = async () => {
  try {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  MOLCOM INC. Time Tracker - Admin Setup ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

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
    console.log('Create your admin account:');
    console.log('');

    const username = await question('Username: ');
    if (!username || username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      process.exit(1);
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.error(`❌ User "${username}" already exists`);
      process.exit(1);
    }

    const password = await question('Password: ');
    if (!password || password.length < 4) {
      console.error('❌ Password must be at least 4 characters');
      process.exit(1);
    }

    const fullName = await question('Full Name: ');
    if (!fullName) {
      console.error('❌ Full name is required');
      process.exit(1);
    }

    console.log('');
    console.log('Creating admin user...');

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

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Setup failed:', error.message);
    console.error('');
    rl.close();
    process.exit(1);
  }
};

setupAdmin();
