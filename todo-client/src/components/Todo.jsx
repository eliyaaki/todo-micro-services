import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
export const Todo = ({
  todo,
  deleteTodo,
  fontAwesomeIconEdit,
  toggleComplete,
}) => {
  return (
    <div className="Todo">
      <p
        className={`${todo?.completed ? "completed" : ""}`}
        onClick={() => toggleComplete(todo._id)}
      >
        {todo?.title}
      </p>
      <div>
        <FontAwesomeIcon
          icon={faPenToSquare}
          onClick={() => fontAwesomeIconEdit(todo?._id)}
        />
        <FontAwesomeIcon icon={faTrash} onClick={() => deleteTodo(todo?._id)} />
      </div>
    </div>
  );
};
