import React, { useEffect, useState } from "react";
import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { v4 as uuidv4 } from "uuid";
import { EditTodoForm } from "./EditTodoForm";
import * as todoApi from "../api/todoApi";

export const TodoWrapper = () => {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const fetchedTodos = await todoApi.getAllTodos();
      setTodos(fetchedTodos);
    };

    fetchData();
  }, []);
  useEffect(() => {
    console.log(`todos: ${todos}`);
  }, [todos]);
  const addTodo = async (todo) => {
    const addedTodo = await todoApi.createTodo(
      todo.title,
      todo.description,
      todo.deadline
    );
    setTodos((prevTodos) => [...prevTodos, addedTodo]);
  };

  const deleteTodo = async (todoId) => {
    await todoApi.deleteTodoById(todoId);
    setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== todoId));
  };

  const toggleComplete = (id) => {
    setTodos(
      todos?.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const editTodo = async (todo, todId) => {
    const updatedTodo = await todoApi.updateTodoById(
      todId,
      todo.title,
      todo.description,
      todo.deadline
    );
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo?._id === updatedTodo._id ? updatedTodo : todo
      )
    );
  };
  const fontAwesomeIconEdit = (todoId) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo._id === todoId ? { ...todo, isEditing: true } : todo
      )
    );
  };

  return (
    <div className="TodoWrapper">
      <h1>Todo App</h1>
      <TodoForm addTodo={addTodo} />
      {todos?.map((todo) =>
        todo.isEditing ? (
          <EditTodoForm key={uuidv4()} editTodo={editTodo} todo={todo} />
        ) : (
          <Todo
            key={uuidv4()}
            todo={todo}
            deleteTodo={deleteTodo}
            fontAwesomeIconEdit={fontAwesomeIconEdit}
            toggleComplete={toggleComplete}
          />
        )
      )}
    </div>
  );
};
