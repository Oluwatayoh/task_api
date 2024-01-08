// userUtils.js
const { readJsonFile, writeJsonFile, generateTaskId } = require("./fileUtils");


const usersFilePath = "users.json";
const tasksFilePath = "tasks.json";

// Task status options
const taskStatusOptions = ["Open", "Pending", "In Progress", "Completed"];


// User Utils

const createUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Check if user already exists
    const usersData = await readJsonFile(usersFilePath);
    if (usersData[username]) {
      res.status(400).send("User already exists.");
    } else {
      // Save user details
      usersData[username] = { username };
      await writeJsonFile(usersFilePath, usersData);
      res.status(200).send("User created successfully.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
};

module.exports = {
  createUser,
};
