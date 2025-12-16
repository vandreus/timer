import { TimeEntry, TimeEntryTask, User, Worksite, Project, Task } from '../models/index.js';
import { checkOverlap, checkActiveTimer } from '../utils/overlapValidation.js';
import { processImage, deleteImage } from '../utils/imageProcessor.js';
import { Op } from 'sequelize';
import path from 'path';

export const getAllTimeEntries = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const where = {};
    
    // Non-admin users can only see their own entries
    if (!req.isAdmin) {
      where.userId = req.userId;
    } else if (userId) {
      where.userId = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime[Op.gte] = new Date(startDate);
      if (endDate) where.startTime[Op.lte] = new Date(endDate);
    }

    const timeEntries = await TimeEntry.findAll({
      where,
      include: [
        { association: 'user', attributes: ['id', 'username', 'fullName'] },
        { association: 'worksite' },
        { association: 'project' },
        { association: 'tasks' },
      ],
      order: [['startTime', 'DESC']],
    });

    res.json({ timeEntries });
  } catch (error) {
    next(error);
  }
};

export const getActiveTimer = async (req, res, next) => {
  try {
    const userId = req.isAdmin && req.query.userId ? req.query.userId : req.userId;

    const activeTimer = await checkActiveTimer(userId);

    if (!activeTimer) {
      return res.json({ activeTimer: null });
    }

    res.json({ activeTimer });
  } catch (error) {
    next(error);
  }
};

export const createTimeEntry = async (req, res, next) => {
  try {
    const {
      entryType = 'timed',
      worksiteId,
      projectId,
      entryDate,
      totalHours,
      startTime,
      endTime,
      breakMinutes,
      notes,
      taskIds,
    } = req.body;

    const userId = req.isAdmin && req.body.userId ? req.body.userId : req.userId;

    if (!worksiteId) {
      return res.status(400).json({ error: 'Worksite is required' });
    }

    if (entryType === 'duration') {
      if (!entryDate || !totalHours) {
        return res.status(400).json({ error: 'Entry date and total hours are required for duration entries' });
      }
    } else {
      if (!startTime) {
        return res.status(400).json({ error: 'Start time is required for timed entries' });
      }

      const activeTimer = await checkActiveTimer(userId);
      if (activeTimer && !endTime) {
        return res.status(400).json({ 
          error: 'You already have an active timer running',
          activeTimer,
        });
      }

      if (endTime) {
        const overlap = await checkOverlap(userId, startTime, endTime);
        if (overlap) {
          return res.status(400).json({
            error: 'Time entry overlaps with existing entry',
            overlappingEntry: overlap,
          });
        }
      }
    }

    const timeEntry = await TimeEntry.create({
      userId,
      entryType,
      worksiteId,
      projectId,
      entryDate,
      totalHours: entryType === 'duration' ? parseFloat(totalHours) : undefined,
      startTime,
      endTime,
      breakMinutes: breakMinutes || 0,
      notes,
      isActive: entryType === 'timed' && !endTime,
    });

    // Process photo if uploaded
    if (req.file) {
      try {
        const processedPath = await processImage(req.file.path);
        timeEntry.photoPath = processedPath;
        await timeEntry.save();
      } catch (error) {
        console.error('Photo processing error:', error);
      }
    }

    // Associate tasks
    if (taskIds && Array.isArray(taskIds)) {
      for (const taskId of taskIds) {
        await TimeEntryTask.create({
          timeEntryId: timeEntry.id,
          taskId,
        });
      }
    }

    // Fetch complete entry with associations
    const completeEntry = await TimeEntry.findByPk(timeEntry.id, {
      include: [
        { association: 'user', attributes: ['id', 'username', 'fullName'] },
        { association: 'worksite' },
        { association: 'project' },
        { association: 'tasks' },
      ],
    });

    res.status(201).json({ timeEntry: completeEntry });
  } catch (error) {
    next(error);
  }
};

export const clockOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { endTime, breakMinutes, notes, taskIds } = req.body;

    const timeEntry = await TimeEntry.findByPk(id);

    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Check ownership (non-admin can only update their own)
    if (!req.isAdmin && timeEntry.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!timeEntry.isActive) {
      return res.status(400).json({ error: 'Timer is not active' });
    }

    const clockOutTime = endTime || new Date();

    // Check for overlaps
    const overlap = await checkOverlap(
      timeEntry.userId,
      timeEntry.startTime,
      clockOutTime,
      id
    );

    if (overlap) {
      return res.status(400).json({
        error: 'Clock out time overlaps with another entry',
        overlappingEntry: overlap,
      });
    }

    timeEntry.endTime = clockOutTime;
    if (breakMinutes !== undefined) timeEntry.breakMinutes = breakMinutes;
    if (notes !== undefined) timeEntry.notes = notes;
    await timeEntry.save();

    // Update tasks if provided
    if (taskIds && Array.isArray(taskIds)) {
      await TimeEntryTask.destroy({ where: { timeEntryId: id } });
      for (const taskId of taskIds) {
        await TimeEntryTask.create({
          timeEntryId: id,
          taskId,
        });
      }
    }

    const completeEntry = await TimeEntry.findByPk(id, {
      include: [
        { association: 'user', attributes: ['id', 'username', 'fullName'] },
        { association: 'worksite' },
        { association: 'project' },
        { association: 'tasks' },
      ],
    });

    res.json({ timeEntry: completeEntry });
  } catch (error) {
    next(error);
  }
};

export const updateTimeEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      startTime,
      endTime,
      breakMinutes,
      notes,
      projectId,
      taskIds,
    } = req.body;

    const timeEntry = await TimeEntry.findByPk(id);

    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Check ownership
    if (!req.isAdmin && timeEntry.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check for overlaps if times changed
    if (startTime || endTime) {
      const newStart = startTime || timeEntry.startTime;
      const newEnd = endTime || timeEntry.endTime;

      if (newEnd) {
        const overlap = await checkOverlap(timeEntry.userId, newStart, newEnd, id);
        if (overlap) {
          return res.status(400).json({
            error: 'Updated times overlap with another entry',
            overlappingEntry: overlap,
          });
        }
      }

      if (startTime) timeEntry.startTime = startTime;
      if (endTime) timeEntry.endTime = endTime;
    }

    if (breakMinutes !== undefined) timeEntry.breakMinutes = breakMinutes;
    if (notes !== undefined) timeEntry.notes = notes;
    if (projectId !== undefined) timeEntry.projectId = projectId;

    await timeEntry.save();

    // Update tasks
    if (taskIds && Array.isArray(taskIds)) {
      await TimeEntryTask.destroy({ where: { timeEntryId: id } });
      for (const taskId of taskIds) {
        await TimeEntryTask.create({
          timeEntryId: id,
          taskId,
        });
      }
    }

    // Process new photo if uploaded
    if (req.file) {
      // Delete old photo
      if (timeEntry.photoPath) {
        await deleteImage(timeEntry.photoPath);
      }
      
      const processedPath = await processImage(req.file.path);
      timeEntry.photoPath = processedPath;
      await timeEntry.save();
    }

    const completeEntry = await TimeEntry.findByPk(id, {
      include: [
        { association: 'user', attributes: ['id', 'username', 'fullName'] },
        { association: 'worksite' },
        { association: 'project' },
        { association: 'tasks' },
      ],
    });

    res.json({ timeEntry: completeEntry });
  } catch (error) {
    next(error);
  }
};

export const deleteTimeEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeEntry = await TimeEntry.findByPk(id);

    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Check ownership
    if (!req.isAdmin && timeEntry.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete photo if exists
    if (timeEntry.photoPath) {
      await deleteImage(timeEntry.photoPath);
    }

    await timeEntry.destroy();

    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};
