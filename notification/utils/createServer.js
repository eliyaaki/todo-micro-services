const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");

function createServer() {
  const appServer = express();
  appServer.use(express.json());
  // Serve Swagger UI
  appServer.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  return appServer;
}

module.exports = createServer;
