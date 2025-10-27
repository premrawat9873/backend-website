const express = require('express');
const cors = require('cors');
const app = express();
const mainRouter = require('./router/index');

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/v1", mainRouter);

// ✅ Global Error Handler (handles any error from routes)
app.use((err, req, res, next) => {
  console.error("🔥 Global error handler caught:", err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// ✅ Catch Unhandled Rejections and Exceptions (prevents server crash)
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

// Start server
app.listen(3000, () => console.log("✅ Server is running on port 3000"));
