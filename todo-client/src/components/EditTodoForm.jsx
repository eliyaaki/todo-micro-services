import React, { useState } from "react";

export const EditTodoForm = ({ editTodo, todo }) => {
  const [title, setTitle] = useState(todo?.title);
  const [description, setDescription] = useState(todo?.description);
  const [deadline, setDeadline] = useState(
    new Date(todo?.deadline).toISOString().split("T")[0]
  );

  const handleSubmit = (e) => {
    // prevent default action
    e.preventDefault();
    // edit todo
    editTodo({ title, description, deadline }, todo?._id);
  };
  return (
    <form onSubmit={handleSubmit} className="TodoForm">
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="todo-input"
        placeholder="title"
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
        id="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="todo-input"
        placeholder="deadline"
      />

      <button type="submit" className="todo-btn">
        Update Task
      </button>
    </form>
  );
};
