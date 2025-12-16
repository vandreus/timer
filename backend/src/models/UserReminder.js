import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserReminder = sequelize.define('UserReminder', {
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
  weekStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'week_start_date',
  },
  missingDays: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    field: 'missing_days',
  },
  isDismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_dismissed',
  },
}, {
  tableName: 'user_reminders',
  timestamps: true,
  underscored: true,
});

export default UserReminder;
