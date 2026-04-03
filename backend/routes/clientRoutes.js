import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const mockClients = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corp Inc' },
  { id: '2', name: 'TechStart', email: 'info@techstart.com', company: 'TechStart LLC' },
  { id: '3', name: 'DataCorp', email: 'hello@datacorp.com', company: 'DataCorp Solutions' },
];

router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, data: mockClients });
});

router.get('/:id', authMiddleware, (req, res) => {
  const client = mockClients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: client });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, email, company } = req.body;
  const newClient = { id: Date.now().toString(), name, email, company };
  mockClients.push(newClient);
  res.status(201).json({ success: true, data: newClient });
});

export default router;
