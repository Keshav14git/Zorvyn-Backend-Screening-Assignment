const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/user.model');
const Record = require('./src/models/record.model');
const { ROLES, USER_STATUS, RECORD_TYPES } = require('./src/utils/constants');

/**
 * Database seed script.
 *
 * Creates:
 * - 3 users (admin, analyst, viewer)
 * - 25 sample financial records across multiple categories and months
 *
 * Usage: npm run seed
 */

// Seed Users

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@finance.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: 'Analyst User',
    email: 'analyst@finance.com',
    password: 'analyst123',
    role: ROLES.ANALYST,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: 'Viewer User',
    email: 'viewer@finance.com',
    password: 'viewer123',
    role: ROLES.VIEWER,
    status: USER_STATUS.ACTIVE,
  },
];

// Seed Records

const generateRecords = (adminId) => [
  // ── January 2024 ──────────────────────────────────
  {
    amount: 8500.00,
    type: RECORD_TYPES.INCOME,
    category: 'Salary',
    date: new Date('2024-01-05'),
    note: 'Monthly salary - January',
    createdBy: adminId,
  },
  {
    amount: 1200.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Rent',
    date: new Date('2024-01-01'),
    note: 'Office rent - January',
    createdBy: adminId,
  },
  {
    amount: 350.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Utilities',
    date: new Date('2024-01-10'),
    note: 'Electricity and water bill',
    createdBy: adminId,
  },
  {
    amount: 1500.00,
    type: RECORD_TYPES.INCOME,
    category: 'Freelance',
    date: new Date('2024-01-15'),
    note: 'Web development project',
    createdBy: adminId,
  },
  {
    amount: 200.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Software',
    date: new Date('2024-01-20'),
    note: 'Cloud hosting subscription',
    createdBy: adminId,
  },

  // ── February 2024 ────────────────────────────────
  {
    amount: 8500.00,
    type: RECORD_TYPES.INCOME,
    category: 'Salary',
    date: new Date('2024-02-05'),
    note: 'Monthly salary - February',
    createdBy: adminId,
  },
  {
    amount: 1200.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Rent',
    date: new Date('2024-02-01'),
    note: 'Office rent - February',
    createdBy: adminId,
  },
  {
    amount: 450.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Marketing',
    date: new Date('2024-02-14'),
    note: 'Social media advertising campaign',
    createdBy: adminId,
  },
  {
    amount: 2000.00,
    type: RECORD_TYPES.INCOME,
    category: 'Consulting',
    date: new Date('2024-02-20'),
    note: 'Financial consulting engagement',
    createdBy: adminId,
  },
  {
    amount: 180.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Office Supplies',
    date: new Date('2024-02-22'),
    note: 'Printer ink and paper',
    createdBy: adminId,
  },

  // ── March 2024 ────────────────────────────────────
  {
    amount: 8500.00,
    type: RECORD_TYPES.INCOME,
    category: 'Salary',
    date: new Date('2024-03-05'),
    note: 'Monthly salary - March',
    createdBy: adminId,
  },
  {
    amount: 1200.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Rent',
    date: new Date('2024-03-01'),
    note: 'Office rent - March',
    createdBy: adminId,
  },
  {
    amount: 3200.00,
    type: RECORD_TYPES.INCOME,
    category: 'Freelance',
    date: new Date('2024-03-12'),
    note: 'Mobile app development project',
    createdBy: adminId,
  },
  {
    amount: 750.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Equipment',
    date: new Date('2024-03-15'),
    note: 'New monitor purchase',
    createdBy: adminId,
  },
  {
    amount: 320.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Utilities',
    date: new Date('2024-03-18'),
    note: 'Internet and phone bill',
    createdBy: adminId,
  },

  // ── April 2024 ────────────────────────────────────
  {
    amount: 9000.00,
    type: RECORD_TYPES.INCOME,
    category: 'Salary',
    date: new Date('2024-04-05'),
    note: 'Monthly salary - April (raise)',
    createdBy: adminId,
  },
  {
    amount: 1200.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Rent',
    date: new Date('2024-04-01'),
    note: 'Office rent - April',
    createdBy: adminId,
  },
  {
    amount: 500.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Insurance',
    date: new Date('2024-04-10'),
    note: 'Business insurance quarterly payment',
    createdBy: adminId,
  },
  {
    amount: 1800.00,
    type: RECORD_TYPES.INCOME,
    category: 'Consulting',
    date: new Date('2024-04-18'),
    note: 'Strategy consulting session',
    createdBy: adminId,
  },
  {
    amount: 250.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Software',
    date: new Date('2024-04-22'),
    note: 'Design tool annual license',
    createdBy: adminId,
  },

  // ── May 2024 ──────────────────────────────────────
  {
    amount: 9000.00,
    type: RECORD_TYPES.INCOME,
    category: 'Salary',
    date: new Date('2024-05-05'),
    note: 'Monthly salary - May',
    createdBy: adminId,
  },
  {
    amount: 1200.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Rent',
    date: new Date('2024-05-01'),
    note: 'Office rent - May',
    createdBy: adminId,
  },
  {
    amount: 600.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Marketing',
    date: new Date('2024-05-10'),
    note: 'Email marketing platform',
    createdBy: adminId,
  },
  {
    amount: 4500.00,
    type: RECORD_TYPES.INCOME,
    category: 'Freelance',
    date: new Date('2024-05-15'),
    note: 'E-commerce platform project',
    createdBy: adminId,
  },
  {
    amount: 380.00,
    type: RECORD_TYPES.EXPENSE,
    category: 'Utilities',
    date: new Date('2024-05-20'),
    note: 'All utilities - May',
    createdBy: adminId,
  },
];

// Main Seed Function

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Record.deleteMany({}),
    ]);

    console.log('Creating users...');
    const createdUsers = await User.create(seedUsers);

    const admin = createdUsers.find((u) => u.role === ROLES.ADMIN);

    console.log('Creating financial records...');
    const records = generateRecords(admin._id);
    await Record.insertMany(records);

    console.log('\n Seed completed successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('Users Created:');
    console.log('─────────────────────────────────────────');

    for (const user of createdUsers) {
      const pwd = seedUsers.find((u) => u.email === user.email).password;
      console.log(`  ${user.role.padEnd(8)} │ ${user.email.padEnd(25)} │ ${pwd}`);
    }

    console.log('─────────────────────────────────────────');
    console.log(`  Records Created: ${records.length}`);
    console.log('─────────────────────────────────────────\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
