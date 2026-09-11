import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';

// Load environment variables so we can access MONGO_URI
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lld-practice';

// Hardcoded ObjectIds to ensure stability across multiple seed runs
const problems = [
  {
    _id: '64a1b2c3d4e5f6a7b8c9d0e1',
    title: 'Design a Parking',
    description: 'Design an Object-Oriented Parking Lot. It should support multiple levels, different vehicle types (Car, Motorcycle, Bus), and calculate fees based on time parked.',
    rubricRules: [
      'Ensure strong encapsulation of vehicle states.',
      'Use composition over inheritance where appropriate.',
      'Adhere to the Single Responsibility Principle.'
    ]
  },
  {
    _id: '64a1b2c3d4e5f6a7b8c9d0e2',
    title: 'Design a Vending Machine',
    description: 'Design a Vending Machine that accepts different denominations of coins, allows item selection, dispenses items, and returns exact change.',
    rubricRules: [
      'Implement the State Design Pattern to handle machine states (Idle, HasMoney, Dispensing).',
      'Ensure proper abstraction for payment processing.',
      'Handle inventory edge cases (e.g., out of stock).'
    ]
  },
  {
    _id: '64a1b2c3d4e5f6a7b8c9d0e3',
    title: 'Design a Library Management System',
    description: 'Design a system that allows users to search for books, check them out, and return them. It should handle late fees and track whether a book is available, reserved, or loaned.',
    rubricRules: [
      'Model relationships clearly between Members, Books, and Library accounts.',
      'Demonstrate polymorphism for different account types (e.g., Student vs. Teacher).',
      'Encapsulate the checkout and reservation logic.'
    ]
  },
  {
    _id: '64a1b2c3d4e5f6a7b8c9d0e4',
    title: 'Design Tic-Tac-Toe',
    description: 'Design a 2-player Tic-Tac-Toe game. It should support an N x N grid and evaluate winning conditions optimally after every move.',
    rubricRules: [
      'Decouple the Game Engine from the UI/Console logic.',
      'Optimize the win-checking algorithm (avoid looping the whole board every time).',
      'Use proper abstraction for the Board and Player entities.'
    ]
  },
  {
    _id: '64a1b2c3d4e5f6a7b8c9d0e5',
    title: 'Design an E-Commerce Checkout System',
    description: 'Design a checkout system for a cart. It should apply various types of discounts (percentage, fixed amount) and support multiple payment methods (Credit Card, PayPal, UPI).',
    rubricRules: [
      'Implement the Strategy Design Pattern for payment processing.',
      'Implement the Decorator or Strategy pattern for applying multiple discounts.',
      'Keep the Cart class strictly focused on holding items (SRP).'
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {dbName: "lld-platform"});
    console.log('✅ Connected successfully.');

    console.log('Clearing old problems...');
    await Problem.deleteMany({}); 

    console.log(`Seeding ${problems.length} problems...`);
    await Problem.insertMany(problems);
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedDatabase();