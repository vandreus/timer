import User from './User.js';
import SystemSettings from './SystemSettings.js';
import Worksite from './Worksite.js';
import Project from './Project.js';
import Task from './Task.js';
import TimeEntry from './TimeEntry.js';
import TimeEntryTask from './TimeEntryTask.js';
import UserReminder from './UserReminder.js';

// Define associations

// User associations
User.hasMany(Worksite, { foreignKey: 'createdBy', as: 'worksites' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'tasks' });
User.hasMany(TimeEntry, { foreignKey: 'userId', as: 'timeEntries' });
User.hasMany(UserReminder, { foreignKey: 'userId', as: 'reminders' });

// Worksite associations
Worksite.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Worksite.hasMany(Project, { foreignKey: 'worksiteId', as: 'projects', onDelete: 'CASCADE' });
Worksite.hasMany(TimeEntry, { foreignKey: 'worksiteId', as: 'timeEntries' });

// Project associations
Project.belongsTo(Worksite, { foreignKey: 'worksiteId', as: 'worksite' });
Project.hasMany(TimeEntry, { foreignKey: 'projectId', as: 'timeEntries' });

// Task associations
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsToMany(TimeEntry, { 
  through: TimeEntryTask, 
  foreignKey: 'taskId', 
  as: 'timeEntries' 
});

// TimeEntry associations
TimeEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TimeEntry.belongsTo(Worksite, { foreignKey: 'worksiteId', as: 'worksite' });
TimeEntry.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
TimeEntry.belongsToMany(Task, { 
  through: TimeEntryTask, 
  foreignKey: 'timeEntryId', 
  as: 'tasks' 
});

// UserReminder associations
UserReminder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  SystemSettings,
  Worksite,
  Project,
  Task,
  TimeEntry,
  TimeEntryTask,
  UserReminder,
};
