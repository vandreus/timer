import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeEntryTask = sequelize.define('TimeEntryTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  timeEntryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'time_entry_id',
    references: {
      model: 'time_entries',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'task_id',
    references: {
      model: 'tasks',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'time_entry_tasks',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

export default TimeEntryTask;
