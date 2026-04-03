// This file will help us rebuild the backend routes using mock data
// Run this to create all proper route files
import fs from 'fs';
import path from 'path';

const routes_dir = './backend/routes';

// Create fixed projectRoutes.js
const projectRoutes = `import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

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
  if (!project) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: project });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, description, budget, deadline } = req.body;
  const newProject = { id: Date.now().toString(), name, description, status: 'ONGOING', budget, deadline };
  mockProjects.push(newProject);
  res.status(201).json({ success: true, data: newProject });
});

export default router;`;

fs.writeFileSync(path.join(routes_dir, 'projectRoutes.js'), projectRoutes);
console.log('Fixed projectRoutes.js');

// Create fixed clientRoutes.js
const clientRoutes = `import express from 'express';
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

export default router;`;

fs.writeFileSync(path.join(routes_dir, 'clientRoutes.js'), clientRoutes);
console.log('Fixed clientRoutes.js');

console.log('All routes fixed!');
