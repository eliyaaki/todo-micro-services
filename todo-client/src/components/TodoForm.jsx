import React, { useState } from "react";

export const TodoForm = ({ addTodo }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const handleSubmit = (e) => {
    // prevent default action
    e.preventDefault();
    if (title) {
      // add todo
      console.log(
        `add request: Title:${title}, Description:${description}, deadline:${deadline}`
      );
      addTodo({ title, description, deadline });
      // clear form after submission
      setTitle("");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="TodoForm">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="todo-input"
        placeholder="Title"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="todo-input"
        placeholder="description"
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="todo-input"
        placeholder="deadline"
      />
      <button type="submit" className="todo-btn">
        Add Task
      </button>
    </form>
  );
};
