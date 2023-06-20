const express = require("express");
const todoController = require("../controllers/todoController");

const router = express.Router();

router.get("/getAllTodos", todoController.getAllTodos);

router.post("/add", todoController.createTodo);

router.put("/update/:todoId", todoController.updateTodo);

router.delete("/delete/:todoId", todoController.deleteTodo);

module.exports = router;
