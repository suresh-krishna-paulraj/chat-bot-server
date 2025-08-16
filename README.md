# LangChain API

A Node.js/Express API built with MVC architecture that uses LangChain to load PDF documents into Pinecone vector database and query them using Google's Gemini AI.

## Architecture

This project follows the MVC (Model-View-Controller) pattern:

- **Models**: Data structures and types (`src/types/`)
- **Views**: API responses (JSON)
- **Controllers**: Handle HTTP requests and responses (`src/controllers/`)
- **Services**: Business logic (`src/services/`)
- **Routes**: API endpoint definitions (`src/routes/`)
- **Middleware**: Error handling and other middleware (`src/middleware/`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name_here
PINECONE_API_KEY=your_pinecone_api_key_here
PORT=3000
```

3. Build the project:

```bash
npm run build
```

4. Start the server:

```bash
npm run dev  # for development with hot reload
# or
npm start    # for production
```

## API Endpoints

### Health Check

- **GET** `/health`
- Returns server status and timestamp

### Load Data

- **POST** `/api/load`
- Loads the PDF file from `./src/data/Dsa.pdf`, processes it, and stores it in Pinecone
- **Response:**

```json
{
  "success": true,
  "message": "Data loaded and stored successfully"
}
```

### Query Data

- **POST** `/api/query`
- **Body:**

```json
{
  "question": "Your question here"
}
```

- **Response:**

```json
{
  "success": true,
  "question": "Your question",
  "answer": "AI generated answer",
  "context": [
    {
      "score": 0.95,
      "metadata": { "text": "relevant text chunk" }
    }
  ]
}
```

## Example Usage

### Load data into Pinecone:

```bash
curl -X POST http://localhost:3000/api/load
```

### Query the loaded data:

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic of the document?"}'
```

## Development

- **Type checking:** `npm run type-check`
- **Build:** `npm run build`
- **Clean build:** `npm run clean && npm run build`
# chat-bot-server
