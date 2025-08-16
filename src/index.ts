import app, { PORT } from './app.js';

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Load data: POST http://localhost:${PORT}/api/load`);
  console.log(`Query data: POST http://localhost:${PORT}/api/query`);
});
