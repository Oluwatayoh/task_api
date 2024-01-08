// fileUtils.js
const fs = require('fs/promises');

// Helper function to read JSON file
const readJsonFile = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

// Helper function to write to JSON file
const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Helper function to generate a unique task ID
const generateTaskId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  readJsonFile,
  writeJsonFile,
  generateTaskId,
};
