import { Project, Worksite } from '../models/index.js';

export const getAllProjects = async (req, res, next) => {
  try {
    const { worksiteId } = req.query;

    const where = {};
    if (worksiteId) {
      where.worksiteId = worksiteId;
    }

    const projects = await Project.findAll({
      where,
      include: [{ association: 'worksite' }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { worksiteId, name, description, isActive } = req.body;

    if (!worksiteId || !name) {
      return res.status(400).json({ error: 'Worksite ID and name are required' });
    }

    const worksite = await Worksite.findByPk(worksiteId);
    if (!worksite) {
      return res.status(404).json({ error: 'Worksite not found' });
    }

    const project = await Project.create({
      worksiteId,
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (isActive !== undefined) project.isActive = isActive;

    await project.save();

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.destroy();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
