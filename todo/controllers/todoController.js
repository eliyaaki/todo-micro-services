const todoService = require("../services/todoService");
const log = require("../utils/logger");

async function getAllTodos(req, res) {
  try {
    const todos = await todoService.getAllTodos();
    return res.status(200).json({ status: 200, data: todos });
  } catch (error) {
    log.info(error);
    res.status(500).send("Internal Server Error");
  }
}

async function createTodo(req, res) {
  const { title, description, deadline } = req.body;

  try {
    const newTodo = await todoService.createTodo(title, description, deadline);
    log.info("TODO added:", newTodo);
    return res.status(200).json({ status: 200, data: newTodo });
  } catch (error) {
    log.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateTodo(req, res) {
  const { todoId } = req.params;
  const updatedTodo = req.body;

  try {
    const todo = await todoService.updateTodo(todoId, updatedTodo);
    log.info("TODO updated:", todo);
    return res.status(200).json({ status: 200, data: todo });
  } catch (error) {
    log.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteTodo(req, res) {
  const { todoId } = req.params;
  try {
    await todoService.deleteTodo(todoId);
    log.info("TODO deleted");
    return res.status(204).send("Todo deleted successfully");
  } catch (error) {
    log.error(error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
