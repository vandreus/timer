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
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
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
    beforeSave: (entry) => {
      // Calculate total hours when end time is set
      if (entry.startTime && entry.endTime) {
        const diffMs = new Date(entry.endTime) - new Date(entry.startTime);
        const diffMinutes = diffMs / (1000 * 60);
        const totalMinutes = diffMinutes - (entry.breakMinutes || 0);
        const totalHours = totalMinutes / 60;
        
        // Round to nearest 15 minutes (0.25 hours)
        entry.totalHours = Math.round(totalHours * 4) / 4;
        entry.isActive = false;
      } else {
        entry.isActive = true;
        entry.totalHours = null;
      }
    },
  },
});

export default TimeEntry;
