export const spec = {
  openapi: "3.0.0",
  info: {
    title: "JailbreakMe API",
    version: "2.0.0",
  },
  servers: [
    {
      url: "https://jailbreakme.xyz/api/json/v1",
      description: "Production server",
    },
    {
      url: "http://localhost/api/json/v1",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Conversations",
      description: "Endpoints for searching and retrieving conversations",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "API key for authenticated endpoints",
      },
    },
    schemas: {
      Conversation: {
        type: "object",
        properties: {
          _id: {
            type: "string",
          },
          address: {
            type: "string",
            description: "Wallet address of the user",
          },
          challenge: {
            type: "string",
            description: "Challenge identifier",
          },
          content: {
            type: "string",
            description: "Message content",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          role: {
            type: "string",
            enum: ["user", "assistant", "system"],
          },
          win: {
            type: "boolean",
            description: "Whether this message won the challenge",
          },
        },
      },
      SearchResponse: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Conversation",
            },
          },
          nextCursor: {
            type: "string",
            description: "Cursor for pagination",
          },
        },
      },
    },
  },
  paths: {
    "/conversations/search": {
      post: {
        tags: ["Conversations"],
        summary: "Search conversations with filters",
        security: [
          {
            ApiKeyAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                "x-display-mode": "form",
                properties: {
                  challenge: {
                    type: "string",
                    description: "Challenge identifier",
                  },
                  address: {
                    type: "string",
                    description: "Wallet address",
                  },
                  content: {
                    type: "string",
                    description: "Message content to search for",
                  },
                  role: {
                    type: "string",
                    enum: ["user", "assistant", "system"],
                    description: "Role of the message sender",
                  },
                  win: {
                    type: "boolean",
                    description: "Filter by winning messages",
                  },
                  start_date: {
                    type: "string",
                    format: "date-time",
                    description: "Start date for date range filter",
                  },
                  end_date: {
                    type: "string",
                    format: "date-time",
                    description: "End date for date range filter",
                  },
                  sort_order: {
                    type: "string",
                    enum: ["asc", "desc"],
                    default: "desc",
                    description: "Sort order for results",
                  },
                  cursor: {
                    type: "string",
                    description: "Pagination cursor",
                  },
                  limit: {
                    type: "integer",
                    default: 20,
                    description: "Number of results per page",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Successful search",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SearchResponse",
                },
              },
            },
          },
          400: {
            description: "Bad request - Invalid parameters",
          },
          401: {
            description: "Unauthorized - Invalid or missing API key",
          },
        },
      },
    },
    "/conversations/search/default": {
      get: {
        tags: ["Conversations"],
        summary: "Get default search results for Myrios challenge",
        description:
          "Public endpoint that returns the latest conversations for Myrios challenge",
        responses: {
          200: {
            description: "Successful search",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SearchResponse",
                },
              },
            },
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
  },
};
