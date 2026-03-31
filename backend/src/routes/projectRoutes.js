import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock projects storage
const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'in-progress',
    budget: 5000,
    deadline: '2024-06-30',
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Build iOS and Android app',
    status: 'active',
    budget: 15000,
    deadline: '2024-12-31',
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrate legacy database',
    status: 'completed',
    budget: 3000,
    deadline: '2024-03-15',
  },
];

// Get all projects
router.get('/', verifyAuth, (req, res) => {
  try {
    res.json(mockProjects);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get single project
router.get('/:id', verifyAuth, (req, res) => {
  try {
    const project = mockProjects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Create project
router.post('/', verifyAuth, (req, res) => {
  try {
    const { name, description, budget, deadline } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name required',
      });
    }

    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      status: 'active',
      budget,
      deadline,
    };

    mockProjects.push(newProject);

    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update project
router.put('/:id', verifyAuth, (req, res) => {
  try {
    const project = mockProjects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    Object.assign(project, req.body);

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete project
router.delete('/:id', verifyAuth, (req, res) => {
  try {
    const index = mockProjects.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const deleted = mockProjects.splice(index, 1);

    res.json({
      success: true,
      data: deleted[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
