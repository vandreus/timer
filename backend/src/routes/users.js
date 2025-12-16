import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getAllUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', resetPassword);
router.delete('/:id', deleteUser);

export default router;
