import axios from "axios";

const BASE_URL = import.meta.env.VITE_TODO_BASE_URL;
// Get all todos
export const getAllTodos = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getAllTodos`);
    const todos = response?.data?.data?.map((todo) => ({
      task: todo.title,
      completed: false,
      isEditing: false,
      ...todo,
    }));
    console.log("todos: ", todos);
    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
};

// Create a new todo
export const createTodo = async (title, description, deadline) => {
  try {
    const response = await axios.post(`${BASE_URL}/add`, {
      title,
      description,
      deadline,
    });
    const createdTodo = {
      task: response?.data?.data?.title,
      completed: false,
      isEditing: false,
      ...response?.data?.data,
    };
    console.log("createdTodo: ", createdTodo);
    return createdTodo;
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
};

// Update a todo by ID
export const updateTodoById = async (todoId, title, description, deadline) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${todoId}`, {
      title,
      description,
      deadline,
    });
    const updatedTodo = {
      task: response?.data?.data?.title,
      completed: false,
      isEditing: false,
      ...response?.data?.data,
    };
    console.log("updatedTodo: ", updatedTodo);
    return updatedTodo;
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
};

// Delete a todo by ID
export const deleteTodoById = async (todoId) => {
  try {
    await axios.delete(`${BASE_URL}/delete/${todoId}`);
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
};
