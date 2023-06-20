require("dotenv/config");
const log = require("./utils/logger.js");
const connectToDb = require("./utils/connectToDb.js");
const createServer = require("./utils/createServer.js");
const cron = require("node-cron");
const {
  connectProducer,
  sendMessageToKafka,
  createTopic,
} = require("./utils/kafka.js");
const { getAllTodos } = require("./services/todoService.js");
const DEADLINE_TOPIC = process.env.DEADLINE_TOPIC || "todo-deadline-checking";

async function gracefulShutdown(app) {
  console.log("Graceful shutdown");

  await app.close();
  await disconnectFromKafka();

  process.exit(0);
}

async function main() {
  const app = createServer();

  await connectToDb();

  await createTopic(DEADLINE_TOPIC);

  await connectProducer();

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    log.info(`Todo application running at: http://localhost:${port}`);
  });

  //its currently sets to run every minute for you to see the effect, change it according to your needs
  cron.schedule("* * * * *", async () => {
    log.info(`cron scheduler triggered`);
    try {
      const todos = await getAllTodos();
      todos.forEach((todo) => {
        sendMessageToKafka(DEADLINE_TOPIC, todo);
      });
    } catch (error) {
      console.error("Error retrieving todos:", error);
    }
  });

  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

  for (let i = 0; i < signals.length; i++) {
    const signal = signals[i];
    process.on(signal, () => {
      gracefulShutdown(app);
    });
  }
}

main();
