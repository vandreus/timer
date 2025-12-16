import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize, { testConnection, syncDatabase } from '../config/database.js';
import readline from 'readline';

const setupAdmin = async () => {
  let rl;
  const question = (query) => {
    if (!rl) {
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
    return new Promise((resolve) => rl.question(query, resolve));
  };

  try {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  MOLCOM INC. Time Tracker - Admin Setup ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    console.log('Connecting to database...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    await syncDatabase(false);

    console.log('');
    console.log('Create your admin account:');
    console.log('');

    let username = process.env.ADMIN_USERNAME;
    if (!username) {
      username = await question('Username: ');
    } else {
      console.log(`Username: ${username} (from env)`);
    }

    if (!username || username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      process.exit(1);
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.error(`❌ User "${username}" already exists`);
      process.exit(1);
    }

    let password = process.env.ADMIN_PASSWORD;
    if (!password) {
      password = await question('Password: ');
    } else {
      console.log('Password: [HIDDEN] (from env)');
    }

    if (!password || password.length < 4) {
      console.error('❌ Password must be at least 4 characters');
      process.exit(1);
    }

    let fullName = process.env.ADMIN_FULLNAME;
    if (!fullName) {
      fullName = await question('Full Name: ');
    } else {
      console.log(`Full Name: ${fullName} (from env)`);
    }

    if (!fullName) {
      console.error('❌ Full name is required');
      process.exit(1);
    }

    console.log('');
    console.log('Creating admin user...');

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

    if (rl) rl.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Setup failed:', error.message);
    console.error('');
    if (rl) rl.close();
    process.exit(1);
  }
};

setupAdmin();
