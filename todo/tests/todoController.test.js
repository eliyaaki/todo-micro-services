const todoService = require("../services/todoService");
const log = require("../utils/logger");
const todoController = require("../controllers/todoController");
const ValidationError = require("../exceptions/ValidationError");
const NotFoundError = require("../exceptions/NotFoundError");
jest.mock("../services/todoService");
jest.mock("../utils/logger");

afterEach(() => {
  jest.restoreAllMocks(); // Restore all mocked functions
});

describe("getAllTodos", () => {
  test("should retrieve all todos and respond with status 200", async () => {
    const todos = [
      {
        id: "1",
        title: "Todo 1",
        description: "Description 1",
        deadline: "2023-06-20T10:00:00",
      },
    ];
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    todoService.getAllTodos.mockResolvedValue(todos);

    await todoController.getAllTodos({}, mockResponse);

    expect(todoService.getAllTodos).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 200,
      data: todos,
    });
  });

  test("should respond with status 500 and send 'Internal Server Error' if an error occurs", async () => {
    const error = new Error("Database error");
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    todoService.getAllTodos.mockRejectedValue(error);

    await todoController.getAllTodos({}, mockResponse);

    expect(todoService.getAllTodos).toHaveBeenCalledTimes(1);
    expect(log.info).toHaveBeenCalledWith(error);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
  });
});

describe("createTodo", () => {
  test("should create a new todo and respond with status 200", async () => {
    const title = "New Todo";
    const description = "New description";
    const deadline = "2023-06-22T10:00:00";
    const newTodo = { id: "1", title, description, deadline };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      body: { title, description, deadline },
    };
    todoService.createTodo.mockResolvedValue(newTodo);

    await todoController.createTodo(mockRequest, mockResponse);

    expect(todoService.createTodo).toHaveBeenCalledWith(
      title,
      description,
      deadline
    );
    expect(log.info).toHaveBeenCalledWith("TODO added:", newTodo);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 201,
      data: newTodo,
    });
  });

  test("should respond with status 500 and send 'Internal Server Error' if an error occurs", async () => {
    const title = "New Todo";
    const description = "New description";
    const deadline = "2023-06-22T10:00:00";
    const error = new Error("Database error");
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockRequest = {
      body: { title, description, deadline },
    };
    todoService.createTodo.mockRejectedValue(error);

    await todoController.createTodo(mockRequest, mockResponse);

    expect(todoService.createTodo).toHaveBeenCalledWith(
      title,
      description,
      deadline
    );
    expect(log.error).toHaveBeenCalledWith(error);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
  });
});

test("should update a todo and respond with status 200", async () => {
  const todoId = "todo-id";
  const updatedTodo = {
    title: "Updated Todo",
    description: "Updated description",
    deadline: "2023-06-21T10:00:00",
  };
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  todoService.updateTodo.mockResolvedValue(updatedTodo);

  const mockRequest = {
    params: { todoId },
    body: updatedTodo,
  };

  await todoController.updateTodo(mockRequest, mockResponse);

  expect(todoService.updateTodo).toHaveBeenCalledWith(todoId, updatedTodo);
  expect(log.info).toHaveBeenCalledWith("TODO updated:", updatedTodo);
  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({
    status: 200,
    data: updatedTodo,
  });
});

test("should respond with status 500 and send 'Internal Server Error' if an error occurs", async () => {
  const todoId = "todo-id";
  const updatedTodo = {
    title: "Updated Todo",
    description: "Updated description",
    deadline: "2023-06-21T10:00:00",
  };
  const error = new Error("Database error");
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  todoService.updateTodo.mockRejectedValue(error);

  const mockRequest = {
    params: { todoId },
    body: updatedTodo,
  };

  await todoController.updateTodo(mockRequest, mockResponse);

  expect(todoService.updateTodo).toHaveBeenCalledWith(todoId, updatedTodo);
  expect(log.error).toHaveBeenCalledWith(error);
  expect(mockResponse.status).toHaveBeenCalledWith(500);
  expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
});

describe("deleteTodo", () => {
  test("should delete a todo and respond with status 204", async () => {
    const todoId = "todo-id";
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    todoService.deleteTodo.mockResolvedValue();

    const mockRequest = {
      params: { todoId },
    };

    await todoController.deleteTodo(mockRequest, mockResponse);

    expect(todoService.deleteTodo).toHaveBeenCalledWith(todoId);
    expect(log.info).toHaveBeenCalledWith("TODO deleted");
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalledWith("Todo deleted successfully");
  });

  test("should respond with status 500 and send 'Internal Server Error' if an error occurs", async () => {
    const todoId = "todoId";
    const error = new Error("Database error");

    const mockRequest = {
      params: { todoId },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    todoService.deleteTodo = jest.fn().mockRejectedValueOnce(error);

    await todoController.deleteTodo(mockRequest, mockResponse);

    expect(todoService.deleteTodo).toHaveBeenCalledWith(todoId);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
  });
});
