import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadPhoto } from '../middleware/upload.js';
import {
  getAllTimeEntries,
  getActiveTimer,
  createTimeEntry,
  clockOut,
  updateTimeEntry,
  deleteTimeEntry,
} from '../controllers/timeEntryController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTimeEntries);
router.get('/active', getActiveTimer);
router.post('/', uploadPhoto, createTimeEntry);
router.put('/:id/clock-out', clockOut);
router.put('/:id', uploadPhoto, updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

export default router;
