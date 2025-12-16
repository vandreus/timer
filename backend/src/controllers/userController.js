import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { username, password, fullName, isAdmin } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Username, password, and full name are required' 
      });
    }

    const user = await User.create({
      username,
      password, // Will be hashed by the model hook
      fullName,
      isAdmin: isAdmin || false,
    });

    res.status(201).json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, fullName, isAdmin } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (typeof isAdmin !== 'undefined') user.isAdmin = isAdmin;

    await user.save();

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = password; // Will be hashed by the model hook
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (user.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
