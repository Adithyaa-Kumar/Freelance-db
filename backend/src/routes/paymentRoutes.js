import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock payments data
const mockPayments = [
  { id: '1', amount: 2500, status: 'PAID', invoiceNumber: 'INV-001', dueDate: '2024-04-01' },
  { id: '2', amount: 5000, status: 'PENDING', invoiceNumber: 'INV-002', dueDate: '2024-04-15' },
  { id: '3', amount: 3000, status: 'PAID', invoiceNumber: 'INV-003', dueDate: '2024-03-31' },
];

// Get all payments
router.get('/', verifyAuth, (req, res) => {
  try {
    res.json(mockPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single payment
router.get('/:id', verifyAuth, (req, res) => {
  try {
    const payment = mockPayments.find(p => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment
router.post('/', verifyAuth, (req, res) => {
  try {
    const { amount, status, invoiceNumber, dueDate } = req.body;
    const newPayment = {
      id: Date.now().toString(),
      amount,
      status,
      invoiceNumber,
      dueDate,
    };
    mockPayments.push(newPayment);
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
