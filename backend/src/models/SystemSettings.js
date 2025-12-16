import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SystemSettings = sequelize.define('SystemSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  logoPath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'logo_path',
  },
  companyName: {
    type: DataTypes.STRING,
    defaultValue: 'MOLCOM INC.',
    field: 'company_name',
  },
  reminderDay: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 1 = Monday
    field: 'reminder_day',
    validate: {
      min: 0,
      max: 6,
    },
  },
}, {
  tableName: 'system_settings',
  timestamps: true,
  underscored: true,
  updatedAt: true,
  createdAt: false,
});

export default SystemSettings;
