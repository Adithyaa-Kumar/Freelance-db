import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mock projects storage
const mockProjects = [
  { id: '1', name: 'Website Redesign', description: 'Complete redesign of company website', status: 'ONGOING', budget: 5000, deadline: '2024-06-30' },
  { id: '2', name: 'Mobile App', description: 'Build iOS and Android app', status: 'ONGOING', budget: 15000, deadline: '2024-12-31' },
  { id: '3', name: 'Database Migration', description: 'Migrate legacy database', status: 'COMPLETED', budget: 3000, deadline: '2024-03-15' },
];

router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, data: mockProjects });
});

router.get('/:id', authMiddleware, (req, res) => {
  const project = mockProjects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, data: project });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, description, budget, deadline } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name required' });
  const newProject = { id: Date.now().toString(), name, description, status: 'ONGOING', budget, deadline };
  mockProjects.push(newProject);
  res.status(201).json({ success: true, data: newProject });
});

export default router;
