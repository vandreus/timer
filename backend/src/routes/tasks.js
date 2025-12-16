import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTasks);
router.post('/', requireAdmin, createTask);
router.put('/:id', requireAdmin, updateTask);
router.delete('/:id', requireAdmin, deleteTask);

export default router;
