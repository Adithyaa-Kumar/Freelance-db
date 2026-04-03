import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock clients data
const mockClients = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corp Inc' },
  { id: '2', name: 'TechStart', email: 'info@techstart.com', company: 'TechStart LLC' },
  { id: '3', name: 'DataCorp', email: 'hello@datacorp.com', company: 'DataCorp Solutions' },
];

// Get all clients
router.get('/', verifyAuth, (req, res) => {
  try {
    res.json({
      success: true,
      data: mockClients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single client
router.get('/:id', verifyAuth, (req, res) => {
  try {
    const client = mockClients.find(c => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }
    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create client
router.post('/', verifyAuth, (req, res) => {
  try {
    const { name, email, company } = req.body;
    const newClient = {
      id: Date.now().toString(),
      name,
      email,
      company,
    };
    mockClients.push(newClient);
    res.status(201).json({
      success: true,
      data: newClient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
