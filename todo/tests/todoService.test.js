const Todo = require("../models/Todo");
const kafka = require("../utils/kafka");
const log = require("../utils/logger");
const todoService = require("../services/todoService");

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
    const deadline = "2023-06-21T10:00:00";
    const currentDate = new Date("2023-06-20T10:00:00");

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
    const currentDate = new Date("2023-06-20T10:00:00");

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
    const deadline = "2023-06-21T10:00:00";
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
  test("should throw an error if an error occurs during todo creation", async () => {
    const title = "Test Todo";
    const description = "Test Description";
    const deadline = "2023-06-21T07:00:00";
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

  test("should throw an error if an error occurs during todo update", async () => {
    const todoId = "todo-id";
    const updatedTodo = {
      title: "Updated Todo",
      description: "Updated description",
      deadline: "2023-06-21T10:00:00",
    };
    const deadline = "2023-06-21T10:00:00";
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
    const findByIdAndRemoveSpy = jest
      .spyOn(Todo, "findByIdAndRemove")
      .mockResolvedValue();

    await todoService.deleteTodo(todoId);

    expect(Todo.findByIdAndRemove).toHaveBeenCalledWith(todoId);
    expect(findByIdAndRemoveSpy).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if an error occurs during todo deletion", async () => {
    const todoId = "todo-id";
    const error = new Error("Database error");
    const findByIdAndRemoveSpy = jest
      .spyOn(Todo, "findByIdAndRemove")
      .mockRejectedValue(error);

    await expect(todoService.deleteTodo(todoId)).rejects.toThrow(error);
    expect(Todo.findByIdAndRemove).toHaveBeenCalledWith(todoId);
    expect(findByIdAndRemoveSpy).toHaveBeenCalledTimes(1);

    findByIdAndRemoveSpy.mockRestore();
  });
});
