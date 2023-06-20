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
  paths: {
    "/todos": {
      get: {
        summary: "Get all todos",
        responses: {
          200: {
            description: "Success",
          },
          500: {
            description: "Server error",
          },
        },
      },
      post: {
        summary: "Create a new todo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                  },
                  deadline: {
                    type: "string",
                    format: "date",
                  },
                },
                required: ["description"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Todo created",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },
    // '/todos/{id}': {
    //   get: {
    //     summary: 'Get a specific todo by ID',
    //     parameters: [
    //       {
    //         name: 'id',
    //         in: 'path',
    //         description: 'Todo ID',
    //         required: true,
    //         schema: {
    //           type: 'string',
    //         },
    //       },
    //     ],
    //     responses: {
    //       '200': {
    //         description: 'Success',
    //       },
    //       '404': {
    //         description: 'Todo not found',
    //       },
    //     },
    //   },
    put: {
      summary: "Update a specific todo by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          description: "Todo ID",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                description: {
                  type: "string",
                },
                deadline: {
                  type: "string",
                  format: "date",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Todo updated",
        },
        404: {
          description: "Todo not found",
        },
        500: {
          description: "Server error",
        },
      },
    },
    delete: {
      summary: "Delete a specific todo by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          description: "Todo ID",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Todo deleted",
        },
        404: {
          description: "Todo not found",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },
};

const specs = swaggerJsdoc(options);

module.exports = specs;
