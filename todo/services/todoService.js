const Todo = require("../models/Todo");
const { sendMessageToKafka } = require("../utils/kafka");
const log = require("../utils/logger");

async function getAllTodos() {
  try {
    const todos = await Todo.find({});
    return todos;
  } catch (error) {
    throw error;
  }
}

async function validateDate(deadline) {
  const currentDate = new Date();
  const providedDeadline = new Date(deadline);

  log.info(`original deadline: ${deadline}`);
  log.info(`providedDeadline: ${providedDeadline}`);
  // Check if the provided deadline is a valid date
  if (isNaN(providedDeadline.getTime())) {
    throw new Error("Invalid deadline date format.");
  }

  // Check if the provided deadline is a future date
  if (providedDeadline <= currentDate) {
    throw new Error("The deadline should be a future date.");
  }
  return providedDeadline;
}

async function createTodo(title, description, deadline) {
  try {
    const providedDeadline = await validateDate(deadline);
    const newTodo = await Todo.create({
      title,
      description,
      deadline: providedDeadline,
    });
    await sendMessageToKafka("todo-deadline-checking", newTodo);
    return newTodo;
  } catch (error) {
    throw error;
  }
}
async function updateTodo(todoId, updatedTodo) {
  try {
    const { deadline } = updatedTodo;
    updatedTodo.deadline = await validateDate(deadline);
    const todo = await Todo.findByIdAndUpdate(todoId, updatedTodo, {
      new: true,
    });
    return todo;
  } catch (error) {
    throw error;
  }
}

async function deleteTodo(todoId) {
  try {
    await Todo.findByIdAndRemove(todoId);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  validateDate,
};
