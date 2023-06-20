require("dotenv/config");
const log = require("./utils/logger.js");
const createServer = require("./utils/createServer.js");
const {
  disconnectConsumer,
  connectConsumer,
  createTopic,
} = require("./utils/kafka.js");
const DEADLINE_TOPIC = process.env.DEADLINE_TOPIC || "todo-deadline-checking";

async function gracefulShutdown(app) {
  console.log("Shutting down...");

  await app.close();

  await disconnectConsumer();
  process.exit(0);
}

async function main() {
  const app = createServer();
  await createTopic(DEADLINE_TOPIC);
  await connectConsumer();

  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    log.info(`Notification application running at: http://localhost:${port}`);
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
