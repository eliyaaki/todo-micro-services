const logger = require("pino");
const dayjs = require("dayjs");

const logLevel = process.env.LOG_Level || "info";
const log = logger({
  transport: {
    target: "pino-pretty",
  },
  level: logLevel,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

module.exports = log;
