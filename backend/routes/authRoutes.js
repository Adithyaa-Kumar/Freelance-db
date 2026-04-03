import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_key_change_this_in_production_12345';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Mock data storage (for development)
const mockUsers = {
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'freelancer',
    password: 'password123', // Mock - never store plaintext in production
  },
  'alice@acmecorp.com': {
    id: '2',
    email: 'alice@acmecorp.com',
    name: 'Alice Johnson',
    role: 'freelancer',
    password: 'SecurePassword123!',
  },
  'bob@techstartup.io': {
    id: '3',
    email: 'bob@techstartup.io',
    name: 'Bob Smith',
    role: 'freelancer',
    password: 'AnotherPassword456!',
  },
};

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

    const user = mockUsers[email];

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Register endpoint
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
    }

    if (mockUsers[email]) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const userId = Object.keys(mockUsers).length + 1;
    const newUser = {
      id: userId.toString(),
      email,
      name,
      role: 'freelancer',
      password, // Mock - never store plaintext in production
    };

    mockUsers[email] = newUser;

    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      data: {
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get profile endpoint
router.get('/me', authMiddleware, (req, res) => {
  try {
    // In a real app, find user by ID from token
    // For mock auth, we'll return a generic user
    res.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'freelancer',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
