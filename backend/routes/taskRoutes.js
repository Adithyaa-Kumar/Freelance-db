import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mock tasks data
const mockTasks = [
  { id: '1', title: 'Design Mockups', status: 'IN_PROGRESS', deadline: '2024-04-15', projectId: '1', priority: 'HIGH', description: 'Create wireframes and UI mockups' },
  { id: '2', title: 'Frontend Dev', status: 'IN_PROGRESS', deadline: '2024-05-01', projectId: '1', priority: 'HIGH', description: 'Build responsive React components' },
  { id: '3', title: 'Backend API', status: 'PENDING', deadline: '2024-05-15', projectId: '2', priority: 'MEDIUM', description: 'Develop REST API endpoints' },
  { id: '4', title: 'Testing', status: 'COMPLETED', deadline: '2024-03-31', projectId: '3', priority: 'MEDIUM', description: 'QA and bug fixes' },
  { id: '5', title: 'Database Setup', status: 'COMPLETED', deadline: '2024-03-20', projectId: '2', priority: 'HIGH', description: 'Configure PostgreSQL database' },
  { id: '6', title: 'Security Review', status: 'IN_PROGRESS', deadline: '2024-04-22', projectId: '1', priority: 'HIGH', description: 'Security audit and penetration testing' },
  { id: '7', title: 'Documentation', status: 'PENDING', deadline: '2024-05-10', projectId: '2', priority: 'LOW', description: 'Write API documentation' },
  { id: '8', title: 'Deployment Setup', status: 'PENDING', deadline: '2024-06-01', projectId: '1', priority: 'MEDIUM', description: 'Configure CI/CD pipeline' },
  { id: '9', title: 'Performance Optimization', status: 'PENDING', deadline: '2024-05-25', projectId: '3', priority: 'HIGH', description: 'Optimize database queries' },
  { id: '10', title: 'User Training', status: 'NOT_STARTED', deadline: '2024-06-15', projectId: '1', priority: 'MEDIUM', description: 'Create training materials' },
];

router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, data: mockTasks });
});

router.get('/:id', authMiddleware, (req, res) => {
  const task = mockTasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: task });
});

router.post('/', authMiddleware, (req, res) => {
  const { title, status, deadline, projectId, priority, description } = req.body;
  const newTask = { id: Date.now().toString(), title, status, deadline, projectId, priority, description };
  mockTasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

export default router;
