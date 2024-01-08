// const express = require("express");
// const bodyParser = require("body-parser");
// const fs = require("fs/promises");
// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());

// // Paths for JSON files
// const usersFilePath = "users.json";
// const tasksFilePath = "tasks.json";

// // Task status options
// const taskStatusOptions = ["Open", "Pending", "In Progress", "Completed"];

// // Swagger options
// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Task Management API",
//       version: "1.0.0",
//       description: "API for managing users and tasks with status.",
//     },
//   },
//   apis: ["app.js"],
// };

// const swaggerSpec = swaggerJsdoc(swaggerOptions);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// /**
//  * @swagger
//  * /login:
//  *   post:
//  *     summary: Create a new user
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: User created successfully
//  *       400:
//  *         description: User already exists
//  *       500:
//  *         description: Internal Server Error
//  */

// // Endpoint to handle user login
// app.post("/login", async (req, res) => {
//   try {
//     const { username } = req.body;

//     // Check if user already exists
//     const usersData = await readJsonFile(usersFilePath);
//     if (usersData[username]) {
//       res.status(400).send("User already exists.");
//     } else {
//       // Save user details
//       usersData[username] = { username };
//       await writeJsonFile(usersFilePath, usersData);
//       res.status(200).send("User created successfully.");
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error.");
//   }
// });

// /**
//  * @swagger
//  * /create-task:
//  *   post:
//  *     summary: Create a new task
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               dueDate:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Task created successfully
//  *       400:
//  *         description: User does not exist
//  *       500:
//  *         description: Internal Server Error
//  */

// // Endpoint to handle task creation
// app.post("/create-task", async (req, res) => {
//   try {
//     const { username, title, description, dueDate } = req.body;

//     // Check if the user exists
//     const usersData = await readJsonFile(usersFilePath);
//     if (!usersData[username]) {
//       res.status(400).send("User does not exist.");
//       return;
//     }

//     // Create a new task
//     const tasksData = await readJsonFile(tasksFilePath);
//     const taskId = generateTaskId();
//     const task = {
//       id: taskId,
//       title,
//       description,
//       dueDate,
//       assignedUser: username,
//       status: "Open",
//     };

//     // Attach task to the user
//     if (!usersData[username].tasks) {
//       usersData[username].tasks = [];
//     }
//     usersData[username].tasks.push(taskId);

//     // Save updated user and task details
//     await writeJsonFile(usersFilePath, usersData);
//     tasksData[taskId] = task;
//     await writeJsonFile(tasksFilePath, tasksData);

//     res.status(200).send("Task created successfully.");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error.");
//   }
// });

// /**
//  * @swagger
//  * /tasks/{username}:
//  *   get:
//  *     summary: Get tasks for a specific user
//  *     parameters:
//  *       - in: path
//  *         name: username
//  *         required: true
//  *         description: The username to get tasks for
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Successful response
//  *       400:
//  *         description: User does not exist
//  *       500:
//  *         description: Internal Server Error
//  */

// // Endpoint to get tasks for a specific user
// app.get("/tasks/:username", async (req, res) => {
//   try {
//     const { username } = req.params;

//     // Check if the user exists
//     const usersData = await readJsonFile(usersFilePath);
//     if (!usersData[username]) {
//       res.status(400).send("User does not exist.");
//       return;
//     }

//     // Get tasks for the user
//     const tasksData = await readJsonFile(tasksFilePath);
//     const userTasks = usersData[username].tasks || [];
//     const userTaskDetails = userTasks.map((taskId) => tasksData[taskId]);

//     res.status(200).json(userTaskDetails);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error.");
//   }
// });

// /**
//  * @swagger
//  * /edit-task/{taskId}:
//  *   put:
//  *     summary: Edit a task, including updating status
//  *     parameters:
//  *       - in: path
//  *         name: taskId
//  *         required: true
//  *         description: The ID of the task to edit
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               dueDate:
//  *                 type: string
//  *               status:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Task updated successfully
//  *       400:
//  *         description: Task does not exist
//  *       500:
//  *         description: Internal Server Error
//  */

// // Endpoint to edit a task (including updating status)
// app.put("/edit-task/:taskId", async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { title, description, dueDate, status } = req.body;

//     // Check if the task exists
//     const tasksData = await readJsonFile(tasksFilePath);
//     if (!tasksData[taskId]) {
//       res.status(400).send("Task does not exist.");
//       return;
//     }

//     // Update task details
//     tasksData[taskId] = {
//       ...tasksData[taskId],
//       title: title || tasksData[taskId].title,
//       description: description || tasksData[taskId].description,
//       dueDate: dueDate || tasksData[taskId].dueDate,
//       status: taskStatusOptions.includes(status)
//         ? status
//         : tasksData[taskId].status,
//     };

//     // Save updated task details
//     await writeJsonFile(tasksFilePath, tasksData);

//     res.status(200).send("Task updated successfully.");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error.");
//   }
// });

// /**
//  * @swagger
//  * /delete-task/{taskId}:
//  *   delete:
//  *     summary: Delete a task
//  *     parameters:
//  *       - in: path
//  *         name: taskId
//  *         required: true
//  *         description: The ID of the task to delete
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Task deleted successfully
//  *       400:
//  *         description: Task does not exist
//  *       500:
//  *         description: Internal Server Error
//  */

// app.delete("/delete-task/:taskId", async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     // Check if the task exists
//     const tasksData = await readJsonFile(tasksFilePath);
//     if (!tasksData[taskId]) {
//       res.status(400).send("Task does not exist.");
//       return;
//     }

//     // Delete the task
//     delete tasksData[taskId];

//     // Update user's task list
//     const usersData = await readJsonFile(usersFilePath);
//     Object.keys(usersData).forEach((username) => {
//       const userTasks = usersData[username].tasks || [];
//       usersData[username].tasks = userTasks.filter((id) => id !== taskId);
//     });

//     // Save updated user and task details
//     await writeJsonFile(usersFilePath, usersData);
//     await writeJsonFile(tasksFilePath, tasksData);

//     res.status(200).send("Task deleted successfully.");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error.");
//   }
// });

// // Helper function to read JSON file
// async function readJsonFile(filePath) {
//   try {
//     const fileContent = await fs.readFile(filePath, "utf-8");
//     return JSON.parse(fileContent);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       return {};
//     }
//     throw error;
//   }
// }

// // Helper function to write to JSON file
// async function writeJsonFile(filePath, data) {
//   await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
// }

// // Helper function to generate a unique task ID
// function generateTaskId() {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "API for managing users and tasks with status.",
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
