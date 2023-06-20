const express = require("express");
const todoRouter = require("../routes/todoRouter");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");
const cors = require("cors");

function createServer() {
  const appServer = express();
  appServer.use(cors());
  appServer.use(express.json());
  appServer.use(todoRouter);
  // Serve Swagger UI
  appServer.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  return appServer;
}

module.exports = createServer;
