import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  worksiteId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'worksite_id',
    references: {
      model: 'worksites',
      key: 'id',
    },
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'project_id',
    references: {
      model: 'projects',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  entryType: {
    type: DataTypes.ENUM('timed', 'duration'),
    defaultValue: 'timed',
    allowNull: false,
    field: 'entry_type',
  },
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'entry_date',
    comment: 'Used for duration-only entries (when entryType=duration)',
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_time',
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time',
  },
  breakMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'break_minutes',
    validate: {
      min: 0,
      isIn: [[0, 15, 30, 60]],
    },
  },
  totalHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'total_hours',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  photoPath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'photo_path',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_active',
  },
}, {
  tableName: 'time_entries',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (entry) => {
      if (entry.entryType === 'duration') {
        if (!entry.entryDate) {
          throw new Error('Entry date is required for duration-only entries');
        }
        if (!entry.totalHours || entry.totalHours <= 0) {
          throw new Error('Total hours must be greater than 0 for duration-only entries');
        }
        entry.startTime = null;
        entry.endTime = null;
        entry.isActive = false;
      } else {
        if (!entry.startTime) {
          throw new Error('Start time is required for timed entries');
        }
        entry.entryDate = entry.startTime.toISOString().split('T')[0];
      }
    },
    beforeSave: (entry) => {
      if (entry.entryType === 'timed') {
        if (entry.startTime && entry.endTime) {
          const diffMs = new Date(entry.endTime) - new Date(entry.startTime);
          const diffMinutes = diffMs / (1000 * 60);
          const totalMinutes = diffMinutes - (entry.breakMinutes || 0);
          const totalHours = totalMinutes / 60;
          
          entry.totalHours = Math.round(totalHours * 4) / 4;
          entry.isActive = false;
        } else {
          entry.isActive = true;
          entry.totalHours = null;
        }
      }
    },
  },
});

export default TimeEntry;
