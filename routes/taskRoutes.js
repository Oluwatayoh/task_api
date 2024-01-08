// taskRoutes.js
const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");

// Define task routes

/**
 * @swagger
 * /tasks/create-task:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task created successfully
 *       400:
 *         description: User does not exist
 *       500:
 *         description: Internal Server Error
 */
router.post("/create-task", TaskController.createTask);

/**
 * @swagger
 * /tasks/{username}:
 *   get:
 *     summary: Get tasks for a specific user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username to get tasks for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: User does not exist
 *       500:
 *         description: Internal Server Error
 */
router.get("/:username", TaskController.getUserTasks);

/**
 * @swagger
 * /tasks/edit-task/{taskId}:
 *   put:
 *     summary: Edit a task, including updating status
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to edit
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Task does not exist
 *       500:
 *         description: Internal Server Error
 */
router.put("/edit-task/:taskId", TaskController.editTask);

/**
 * @swagger
 * /tasks/delete-task/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Task does not exist
 *       500:
 *         description: Internal Server Error
 */
router.delete("/delete-task/:taskId", TaskController.deleteTask);

module.exports = router;
