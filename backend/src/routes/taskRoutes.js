import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock tasks data
const mockTasks = [
  { id: '1', title: 'Design Mockups', status: 'IN_PROGRESS', deadline: '2024-04-15', projectId: '1' },
  { id: '2', title: 'Frontend Dev', status: 'IN_PROGRESS', deadline: '2024-05-01', projectId: '1' },
  { id: '3', title: 'Backend API', status: 'PENDING', deadline: '2024-05-15', projectId: '2' },
  { id: '4', title: 'Testing', status: 'COMPLETED', deadline: '2024-03-31', projectId: '3' },
];

// Get all tasks
router.get('/', verifyAuth, (req, res) => {
  try {
    res.json({
      success: true,
      data: mockTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single task
router.get('/:id', verifyAuth, (req, res) => {
  try {
    const task = mockTasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create task
router.post('/', verifyAuth, (req, res) => {
  try {
    const { title, status, deadline, projectId } = req.body;
    const newTask = {
      id: Date.now().toString(),
      title,
      status,
      deadline,
      projectId,
    };
    mockTasks.push(newTask);
    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
