import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mock payments data
const mockPayments = [
  { id: '1', amount: 2500, status: 'PAID', invoiceNumber: 'INV-001', dueDate: '2024-04-01', project: 'Website Redesign', client: 'Acme Corp', paidDate: '2024-04-01' },
  { id: '2', amount: 5000, status: 'PENDING', invoiceNumber: 'INV-002', dueDate: '2024-04-15', project: 'Mobile App', client: 'TechStart', paidDate: null },
  { id: '3', amount: 3000, status: 'PAID', invoiceNumber: 'INV-003', dueDate: '2024-03-31', project: 'Database Migration', client: 'Acme Corp', paidDate: '2024-03-30' },
  { id: '4', amount: 8000, status: 'PAID', invoiceNumber: 'INV-004', dueDate: '2024-04-05', project: 'API Development', client: 'DataCorp', paidDate: '2024-04-05' },
  { id: '5', amount: 4500, status: 'OVERDUE', invoiceNumber: 'INV-005', dueDate: '2024-03-15', project: 'Mobile App', client: 'TechStart', paidDate: null },
  { id: '6', amount: 6000, status: 'PENDING', invoiceNumber: 'INV-006', dueDate: '2024-04-30', project: 'Website Redesign', client: 'Design Co', paidDate: null },
  { id: '7', amount: 2000, status: 'PAID', invoiceNumber: 'INV-007', dueDate: '2024-03-25', project: 'Consultation', client: 'StartupXYZ', paidDate: '2024-03-24' },
  { id: '8', amount: 7500, status: 'PENDING', invoiceNumber: 'INV-008', dueDate: '2024-05-01', project: 'E-Commerce Platform', client: 'RetailCorp', paidDate: null },
];

router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, data: mockPayments });
});

router.get('/:id', authMiddleware, (req, res) => {
  const payment = mockPayments.find(p => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: payment });
});

router.post('/', authMiddleware, (req, res) => {
  const { amount, status, invoiceNumber, dueDate, project, client } = req.body;
  const newPayment = { id: Date.now().toString(), amount, status, invoiceNumber, dueDate, project, client, paidDate: null };
  mockPayments.push(newPayment);
  res.status(201).json({ success: true, data: newPayment });
});

export default router;
