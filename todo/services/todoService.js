const Todo = require("../models/Todo");
const { sendMessageToKafka } = require("../utils/kafka");
const log = require("../utils/logger");
const DEADLINE_TOPIC = process.env.DEADLINE_TOPIC || "todo-deadline-checking";
const ValidationError = require("../exceptions/ValidationError");
const NotFoundError = require("../exceptions/NotFoundError");

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
    throw new ValidationError("Invalid deadline date format.");
  }

  // Check if the provided deadline is a future date
  if (providedDeadline <= currentDate) {
    throw new ValidationError("The deadline should be a future date.");
  }
  return providedDeadline;
}
function validateTitle(title) {
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new ValidationError(
      "Invalid title. Title must be a non-empty string."
    );
  }
}

function validateDescription(description) {
  if (
    !description ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    throw new ValidationError(
      "Invalid description. Description must be a non-empty string."
    );
  }
}
function validateTodoId(todoId) {
  if (!todoId || typeof todoId !== "string" || todoId.trim() === "") {
    throw new ValidationError(
      "Invalid todoId. todoId must be a non-empty string."
    );
  }
}
async function validateTodoExistenceInDb(todoId) {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw new NotFoundError("Todo not found");
  }
}
async function createTodo(title, description, deadline) {
  try {
    const providedDeadline = await validateDate(deadline);
    validateTitle(title);
    validateDescription(description);
    const newTodo = await Todo.create({
      title,
      description,
      deadline: providedDeadline,
    });
    //sending created todo to todo-deadline-checking kafka-topic
    await sendMessageToKafka(DEADLINE_TOPIC, newTodo);
    return newTodo;
  } catch (error) {
    throw error;
  }
}
async function updateTodo(todoId, updatedTodo) {
  try {
    const { deadline } = updatedTodo;
    updatedTodo.deadline = await validateDate(deadline);
    validateTitle(updatedTodo.title);
    validateDescription(updatedTodo.description);
    validateTodoId(todoId);
    await validateTodoExistenceInDb(todoId);

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
    validateTodoId(todoId);
    await validateTodoExistenceInDb(todoId);
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
