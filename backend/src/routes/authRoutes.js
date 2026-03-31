import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock data storage (for development)
const mockUsers = {
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123', // Mock - never store plaintext in production
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

    // Generate mock token
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Register endpoint
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name required',
      });
    }

    if (mockUsers[email]) {
      return res.status(409).json({
        error: 'User already exists',
      });
    }

    const newUser = { id: Date.now().toString(), email, name, password };
    mockUsers[email] = newUser;

    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get current user
router.get('/me', verifyAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name || 'Test User',
  });
});

export default router;
