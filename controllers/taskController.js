// taskController.js
const { createTask, getUserTasks, editTask, deleteTask } = require('../utils/taskUtils');

// Task Controller
const TaskController = {
  createTask,
  getUserTasks,
  editTask,
  deleteTask,
};

module.exports = TaskController;
