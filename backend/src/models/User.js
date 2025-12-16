import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name',
    validate: {
      notEmpty: true,
    },
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_admin',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, 10);
        delete user.password;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.passwordHash = await bcrypt.hash(user.password, 10);
        delete user.password;
      }
    },
  },
});

// Instance method to validate password
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Instance method to safely return user data (without password)
User.prototype.toSafeObject = function() {
  const { passwordHash, ...safeUser } = this.toJSON();
  return safeUser;
};

export default User;
