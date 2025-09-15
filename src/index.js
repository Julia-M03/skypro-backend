const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require("./middleware/logger");
const corsMiddleware = require("./middleware/cors"); 

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(logger);
app.use(corsMiddleware);

const {
  API_URL = "http://127.0.0.1",
  PORT = "3005",
  MONGO_URL = "mongodb://localhost:27017/library",
} = process.env;

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.use(userRoutes);
app.use(bookRoutes);

app.get("/", (req, res) => {
  res.status(200).send({ 
    message: "Library API is running!",
    endpoints: {
      users: {
        getAll: "GET /users",
        getOne: "GET /users/:user_id",
        create: "POST /users",
        update: "PATCH /users/:user_id",
        delete: "DELETE /users/:user_id"
      },
      books: {
        getAll: "GET /books",
        getOne: "GET /books/:book_id",
        create: "POST /books",
        update: "PATCH /books/:book_id",
        delete: "DELETE /books/:book_id",
        getUserBooks: "GET /users/:user_id/books",
        getUserBook: "GET /users/:user_id/books/:book_id",
        addBookToUser: "PUT /users/:user_id/books/:book_id"
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).send({ 
    error: "Route not found",
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).send({ 
      error: "Validation Error",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).send({ 
      error: "Duplicate key error",
      details: "A record with this value already exists"
    });
  }
  
  res.status(500).send({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${API_URL}:${PORT}`);
  console.log(`API documentation available at ${API_URL}:${PORT}/`);
});