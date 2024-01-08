// taskUtils.js
const { readJsonFile, writeJsonFile, generateTaskId } = require("./fileUtils");


const usersFilePath = "users.json";
const tasksFilePath = "tasks.json";

// Task status options
const taskStatusOptions = ["Open", "Pending", "In Progress", "Completed"];





// Endpoint to handle task creation
const createTask = async (req, res) => {
  try {
    const { username, title, description, dueDate } = req.body;

    // Check if the user exists
    const usersData = await readJsonFile(usersFilePath);
    if (!usersData[username]) {
      res.status(400).send("User does not exist.");
      return;
    }

    // Create a new task
    const tasksData = await readJsonFile(tasksFilePath);
    const taskId = generateTaskId();
    const task = {
      id: taskId,
      title,
      description,
      dueDate,
      assignedUser: username,
      status: "Open",
    };

    // Attach task to the user
    if (!usersData[username].tasks) {
      usersData[username].tasks = [];
    }
    usersData[username].tasks.push(taskId);

    // Save updated user and task details
    await writeJsonFile(usersFilePath, usersData);
    tasksData[taskId] = task;
    await writeJsonFile(tasksFilePath, tasksData);

    res.status(200).send("Task created successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
};


// Endpoint to get tasks for a specific user
const getUserTasks = async (req, res) => {
  try {
    const { username } = req.params;

    // Check if the user exists
    const usersData = await readJsonFile(usersFilePath);
    if (!usersData[username]) {
      res.status(400).send("User does not exist.");
      return;
    }

    // Get tasks for the user
    const tasksData = await readJsonFile(tasksFilePath);
    const userTasks = usersData[username].tasks || [];
    const userTaskDetails = userTasks.map((taskId) => tasksData[taskId]);

    res.status(200).json(userTaskDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
};

// Endpoint to edit a task (including updating status)
const editTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, status } = req.body;

    // Check if the task exists
    const tasksData = await readJsonFile(tasksFilePath);
    if (!tasksData[taskId]) {
      res.status(400).send("Task does not exist.");
      return;
    }

    // Update task details
    tasksData[taskId] = {
      ...tasksData[taskId],
      title: title || tasksData[taskId].title,
      description: description || tasksData[taskId].description,
      dueDate: dueDate || tasksData[taskId].dueDate,
      status: taskStatusOptions.includes(status)
        ? status
        : tasksData[taskId].status,
    };

    // Save updated task details
    await writeJsonFile(tasksFilePath, tasksData);

    res.status(200).send("Task updated successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if the task exists
    const tasksData = await readJsonFile(tasksFilePath);
    if (!tasksData[taskId]) {
      res.status(400).send("Task does not exist.");
      return;
    }

    // Delete the task
    delete tasksData[taskId];

    // Update user's task list
    const usersData = await readJsonFile(usersFilePath);
    Object.keys(usersData).forEach((username) => {
      const userTasks = usersData[username].tasks || [];
      usersData[username].tasks = userTasks.filter((id) => id !== taskId);
    });

    // Save updated user and task details
    await writeJsonFile(usersFilePath, usersData);
    await writeJsonFile(tasksFilePath, tasksData);

    res.status(200).send("Task deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
};

module.exports = {
  createTask,
  getUserTasks,
  editTask,
  deleteTask,
};
