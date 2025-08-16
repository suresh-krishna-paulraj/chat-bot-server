# Project Structure

```
src/
├── controllers/           # Controllers (MVC - Controller)
│   └── langchain.controller.ts
├── middleware/           # Express middleware
│   └── error.middleware.ts
├── models/              # Data models (MVC - Model)
│   └── (empty - using types instead)
├── routes/              # Route definitions
│   ├── index.ts         # Main routes
│   └── langchain.routes.ts
├── services/            # Business logic (MVC - Service layer)
│   └── langchain.service.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── data/                # Data files
│   ├── Dsa.pdf
│   └── ...
├── app.ts               # Express app configuration
├── index.ts             # Server entry point
└── prompt.ts            # Legacy prompt file
```

## MVC Architecture

### Models (src/types/)
- Define data structures and interfaces
- Type-safe API contracts
- Shared across the application

### Views (API Responses)
- JSON responses for API endpoints
- Consistent response format
- Error handling included

### Controllers (src/controllers/)
- Handle HTTP requests and responses
- Input validation
- Call appropriate services
- Format responses

### Services (src/services/)
- Business logic implementation
- LangChain integration
- Pinecone operations
- AI model interactions

### Routes (src/routes/)
- Define API endpoints
- Route middleware
- Request routing to controllers

### Middleware (src/middleware/)
- Error handling
- Request/response processing
- Cross-cutting concerns

## Key Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easy to modify individual components
3. **Testability**: Services can be tested independently
4. **Scalability**: Easy to add new features and endpoints
5. **Type Safety**: Full TypeScript support throughout
