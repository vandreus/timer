import { TimeEntry } from '../models/index.js';
import { Op } from 'sequelize';

// Check if a time entry overlaps with existing entries for a user
export const checkOverlap = async (userId, startTime, endTime, excludeEntryId = null) => {
  const where = {
    userId,
    [Op.or]: [
      // New entry starts during an existing entry
      {
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: startTime },
      },
      // New entry ends during an existing entry
      {
        startTime: { [Op.lte]: endTime },
        endTime: { [Op.gte]: endTime },
      },
      // New entry completely encompasses an existing entry
      {
        startTime: { [Op.gte]: startTime },
        endTime: { [Op.lte]: endTime },
      },
    ],
  };

  // Exclude current entry when updating
  if (excludeEntryId) {
    where.id = { [Op.ne]: excludeEntryId };
  }

  const overlappingEntry = await TimeEntry.findOne({ where });

  return overlappingEntry;
};

// Check if user has an active timer
export const checkActiveTimer = async (userId, excludeEntryId = null) => {
  const where = {
    userId,
    isActive: true,
  };

  if (excludeEntryId) {
    where.id = { [Op.ne]: excludeEntryId };
  }

  const activeEntry = await TimeEntry.findOne({ 
    where,
    include: [
      { association: 'worksite' },
      { association: 'project' },
    ],
  });

  return activeEntry;
};
