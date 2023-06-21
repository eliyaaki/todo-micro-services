const Todo = require("../models/Todo");
const kafka = require("../utils/kafka");
const log = require("../utils/logger");
const todoService = require("../services/todoService");
const ValidationError = require("../exceptions/ValidationError");
const NotFoundError = require("../exceptions/NotFoundError");
jest.mock("../models/Todo");
jest.mock("../utils/kafka");
jest.mock("../utils/logger");

afterEach(() => {
  jest.restoreAllMocks(); // Restore all mocked functions
});

describe("getAllTodos", () => {
  test("should return all todos from the database", async () => {
    const mockTodos = [{ title: "Todo 1" }];
    Todo.find.mockResolvedValue(mockTodos);

    const todos = await todoService.getAllTodos();

    expect(Todo.find).toHaveBeenCalledTimes(1);
    expect(todos).toEqual(mockTodos);
  });

  test("should throw an error if an error occurs during database retrieval", async () => {
    const error = new Error("Database error");
    Todo.find.mockRejectedValue(error);

    await expect(todoService.getAllTodos()).rejects.toThrow(error);
    expect(Todo.find).toHaveBeenCalledTimes(1);
  });
});

describe("validateDate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return the provided deadline if it is a valid future date", async () => {
    const deadline = "2030-06-21T10:00:00";
    const result = await todoService.validateDate(deadline);

    expect(log.info).toHaveBeenCalledWith(`original deadline: ${deadline}`);
    expect(log.info).toHaveBeenCalledWith(
      `providedDeadline: ${new Date(deadline)}`
    );
    expect(result).toEqual(new Date(deadline));
  });

  test("should throw an error if the provided deadline is an invalid date format", async () => {
    const deadline = "Invalid Date";

    await expect(todoService.validateDate(deadline)).rejects.toThrow(
      "Invalid deadline date format."
    );
    expect(log.info).toHaveBeenCalledWith(`original deadline: ${deadline}`);
    expect(log.info).toHaveBeenCalledWith(
      `providedDeadline: ${new Date(deadline)}`
    );
  });

  test("should throw an error if the provided deadline is not a future date", async () => {
    const deadline = "2023-06-19T10:00:00";
    const mockTodo = { _id: "grgrrg" };
    const findByIdSpy = jest
      .spyOn(Todo, "findById")
      .mockResolvedValue(mockTodo); // Simulate not finding the todo
    await expect(todoService.validateDate(deadline)).rejects.toThrow(
      "The deadline should be a future date."
    );
    expect(log.info).toHaveBeenCalledWith(`original deadline: ${deadline}`);
    expect(log.info).toHaveBeenCalledWith(
      `providedDeadline: ${new Date(deadline)}`
    );
  });
});

describe("createTodo", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("should create a new todo and send a message to Kafka", async () => {
    const title = "Test Todo";
    const description = "Test Description";
    const deadline = "2030-06-21T10:00:00";
    const deadlineConversion = new Date(deadline);
    const mockNewTodo = { title, description, deadlineConversion };

    const createTodoSpy = jest
      .spyOn(Todo, "create")
      .mockResolvedValue(mockNewTodo);
    const sendMessageToKafkaMock = jest
      .spyOn(kafka, "sendMessageToKafka")
      .mockResolvedValue();

    const newTodo = await todoService.createTodo(title, description, deadline);
    expect(createTodoSpy).toHaveBeenCalledWith({
      title,
      description,
      deadline: deadlineConversion,
    });
    expect(sendMessageToKafkaMock).toHaveBeenCalledWith(
      "todo-deadline-checking",
      newTodo
    );

    createTodoSpy.mockRestore();
    sendMessageToKafkaMock.mockRestore();
  });
  test("should throw an error with invalid title", async () => {
    // Define the mock title, description, and deadline with an invalid title
    const title = null; // Set the title to null or any other invalid value
    const description = "New Description";
    const deadline = "2023-06-22T00:00:00.000Z";

    // Call the createTodo function and expect it to throw an error
    await expect(
      todoService.createTodo(title, description, deadline)
    ).rejects.toThrow("Invalid title");

    // Assert that the Todo model's create method is not called
    expect(Todo.create).not.toHaveBeenCalled();
  });

  test("should throw an error with invalid deadline", async () => {
    // Define the mock title, description, and deadline with an invalid deadline

    const title = "New Title";
    const description = "New Description";
    const deadline = "Invalid Deadline";

    // Call the createTodo function and expect it to throw an error
    await expect(
      todoService.createTodo(title, description, deadline)
    ).rejects.toThrow("Invalid deadline date format.");
    // Assert that the Todo model's create method is not called
    expect(Todo.create).not.toHaveBeenCalled();
  });
  test("should throw an error if an error occurs during todo creation", async () => {
    const title = "Test Todo";
    const description = "Test Description";
    const deadline = "2030-06-21T07:00:00";
    const deadlineConversion = new Date(deadline);
    const error = new Error("Error occurred during todo creation");

    const createTodoSpy = jest.spyOn(Todo, "create").mockRejectedValue(error);
    const sendMessageToKafkaMock = jest
      .spyOn(kafka, "sendMessageToKafka")
      .mockResolvedValue();

    await expect(
      todoService.createTodo(title, description, deadline)
    ).rejects.toThrow(error);

    expect(createTodoSpy).toHaveBeenCalledWith({
      title,
      description,
      deadline: deadlineConversion,
    });
    expect(sendMessageToKafkaMock).not.toHaveBeenCalled();

    createTodoSpy.mockRestore();
    sendMessageToKafkaMock.mockRestore();
  });
});

describe("updateTodo", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update a todo and return the updated todo", async () => {
    const todoId = "todo-id";
    const updatedTodo = {
      title: "Updated Todo",
      description: "Updated description",
      deadline: "2023-06-22T10:00:00",
    };

    const mockTodo = { _id: todoId };
    const findByIdSpy = jest
      .spyOn(Todo, "findById")
      .mockResolvedValue(mockTodo); // Simulate not finding the todo
    const deadline = "2027-06-21T10:00:00";
    const providedDeadline = new Date(deadline);
    const mockUpdatedTodo = {
      _id: todoId,
      ...updatedTodo,
      deadline: providedDeadline,
    };
    const findByIdAndUpdateSpy = jest
      .spyOn(Todo, "findByIdAndUpdate")
      .mockResolvedValue(mockUpdatedTodo);

    const result = await todoService.updateTodo(todoId, updatedTodo);

    expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
      todoId,
      {
        title: updatedTodo.title,
        description: updatedTodo.description,
        deadline: expect.any(Date),
      },
      { new: true }
    );
    expect(result).toEqual(mockUpdatedTodo);
  });

  test("should throw an error with invalid title", async () => {
    // Define the mock todoId and updatedTodo with an invalid title
    const todoId = "123456789";
    const updatedTodo = {
      title: "",
      description: "Updated Description",
      deadline: "2023-06-22T00:00:00.000Z",
    };

    // Call the updateTodo function and expect it to throw an error
    await expect(todoService.updateTodo(todoId, updatedTodo)).rejects.toThrow(
      "Invalid title"
    );

    // Assert that the Todo model's findByIdAndUpdate method is not called
    expect(Todo.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  test("should throw an error with invalid deadline", async () => {
    // Define the mock title, description, and deadline with an invalid deadline
    const todoId = "123456789";
    const updatedTodo = {
      title: "New Title",
      description: "Updated Description",
      deadline: "Invalid Deadline",
    };

    // Call the updateTodo function and expect it to throw an error
    await expect(todoService.updateTodo(todoId, updatedTodo)).rejects.toThrow(
      "Invalid deadline date format."
    );
    // Assert that the Todo model's findByIdAndUpdate method is not called
    expect(Todo.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  test("should throw an error if an error occurs during todo update", async () => {
    const todoId = "todo-id";
    const updatedTodo = {
      title: "Updated Todo",
      description: "Updated description",
      deadline: "2030-06-21T10:00:00",
    };
    const deadline = "2023-06-21T10:00:00";
    const mockTodo = { _id: todoId };
    const findByIdSpy = jest
      .spyOn(Todo, "findById")
      .mockResolvedValue(mockTodo); // Simulate not finding the todo
    const error = new Error("The deadline should be a future date.");
    const findByIdAndUpdateSpy = jest
      .spyOn(Todo, "findByIdAndUpdate")
      .mockRejectedValue(error);

    await expect(todoService.updateTodo(todoId, updatedTodo)).rejects.toThrow(
      error
    );
    expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
      todoId,
      {
        title: updatedTodo.title,
        description: updatedTodo.description,
        deadline: expect.any(Date),
      },
      { new: true }
    );
  });
});

describe("deleteTodo", () => {
  test("should delete a todo from the database", async () => {
    const todoId = "todo-id";
    const mockTodo = { _id: todoId };
    const findByIdSpy = jest
      .spyOn(Todo, "findById")
      .mockResolvedValue(mockTodo);
    const findByIdAndRemoveSpy = jest
      .spyOn(Todo, "findByIdAndRemove")
      .mockResolvedValue();

    await todoService.deleteTodo(todoId);

    expect(Todo.findById).toHaveBeenCalledWith(todoId);
    expect(findByIdSpy).toHaveBeenCalledTimes(1);
    expect(Todo.findByIdAndRemove).toHaveBeenCalledWith(todoId);
    expect(findByIdAndRemoveSpy).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if an error occurs during todo deletion", async () => {
    const todoId = "todo-id";
    const error = new Error("Database error");
    const mockTodo = { _id: todoId };
    const findByIdSpy = jest
      .spyOn(Todo, "findById")
      .mockResolvedValue(mockTodo); // Simulate not finding the todo
    const findByIdAndRemoveSpy = jest
      .spyOn(Todo, "findByIdAndRemove")
      .mockRejectedValue(error);

    await expect(todoService.deleteTodo(todoId)).rejects.toThrow(error);
    expect(Todo.findById).toHaveBeenCalledWith(todoId);
    expect(findByIdSpy).toHaveBeenCalledTimes(1);
    expect(Todo.findByIdAndRemove).toHaveBeenCalledWith(todoId);
    expect(findByIdAndRemoveSpy).toHaveBeenCalledTimes(1);

    findByIdSpy.mockRestore();
    findByIdAndRemoveSpy.mockRestore();
  });

  test("should throw a NotFoundError if the todo does not exist in the database", async () => {
    const todoId = "non-existent-todo-id";
    const findByIdSpy = jest.spyOn(Todo, "findById").mockResolvedValue(null); // Simulate not finding the todo

    await expect(todoService.deleteTodo(todoId)).rejects.toThrow(NotFoundError);
    expect(Todo.findById).toHaveBeenCalledWith(todoId);
    expect(findByIdSpy).toHaveBeenCalledTimes(1);

    findByIdSpy.mockRestore();
  });
});
