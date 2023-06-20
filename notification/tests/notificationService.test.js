const log = require("../utils/logger");
const notificationService = require("../services/notificationService");

jest.mock("../utils/logger");

afterEach(() => {
  jest.restoreAllMocks(); // Restore all mocked functions
});

describe("checkDeadlineExpiration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should log that the todo is not expired if the deadline has not passed", async () => {
    const todo = { title: "Test Todo", deadline: "2028-06-21T10:00:00" };

    await notificationService.checkDeadlineExpiration(todo);

    expect(log.info).toHaveBeenCalledWith(
      `Todo '${todo.title}' is not expired`
    );
  });

  test("should log that the todo is expired and call sendNotification if the deadline has passed", async () => {
    const todo = {
      title: "Test Todo",
      description: "Test Description",
      deadline: "2023-06-15T10:00:00",
    };
    await notificationService.checkDeadlineExpiration(todo);

    expect(log.info).toHaveBeenCalledWith(`Todo '${todo.title}' is expired`);
    expect(log.info).toHaveBeenCalledWith(
      `The sendNotification method already been implemented`
    );
  });

  test("should throw an error if an error occurs during the execution", async () => {
    const todo = {
      title: "Test Todo",
      description: "Test Description",
      deadline: "2023-06-19T10:00:00",
    };
    const error = new Error("Test error");

    jest.spyOn(global, "Date").mockImplementation(() => {
      throw error;
    });

    await expect(
      notificationService.checkDeadlineExpiration(todo)
    ).rejects.toThrow(error);

    jest.restoreAllMocks();
  });
});

describe("sendNotification", () => {
  test("should log that the method is already implemented", async () => {
    await notificationService.sendNotification();

    expect(log.info).toHaveBeenCalledWith(
      "The sendNotification method already been implemented"
    );
  });
});
