import { Task } from '../models/index.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      order: [['name', 'ASC']],
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const task = await Task.create({
      name,
      description,
      createdBy: req.userId,
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (name) task.name = name;
    if (description !== undefined) task.description = description;

    await task.save();

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
