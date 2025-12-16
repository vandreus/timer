import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getAllWorksites,
  createWorksite,
  updateWorksite,
  deleteWorksite,
} from '../controllers/worksiteController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllWorksites);
router.post('/', requireAdmin, createWorksite);
router.put('/:id', requireAdmin, updateWorksite);
router.delete('/:id', requireAdmin, deleteWorksite);

export default router;
