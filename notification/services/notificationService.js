const log = require("../utils/logger");

async function checkDeadlineExpiration(todo) {
  try {
    // Check if the deadline has not passed
    const givenDateDeadline = new Date(todo.deadline);

    // Get the current date
    const currentDate = new Date();

    if (givenDateDeadline > currentDate.getTime()) {
      // Deadline has not passed
      log.info(`Todo '${todo.title}' is not expired`);
    } else {
      // Deadline has passed
      log.info(`Todo '${todo.title}' is expired`);
      // The provided implementation of sendNotification
      await sendNotification(todo);
    }
  } catch (error) {
    throw error;
  }
}

async function sendNotification(todo) {
  log.info("The sendNotification method already been implemented");
}

module.exports = {
  checkDeadlineExpiration,
  sendNotification,
};
