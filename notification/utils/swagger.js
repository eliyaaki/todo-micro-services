const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TODO API",
      version: "1.0.0",
      description: "API documentation for the TODO application",
    },
  },
  apis: ["./routes/*.js"], // Path to the API route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
