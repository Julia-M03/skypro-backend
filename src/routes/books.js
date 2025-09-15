const router = require("express").Router();

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getBooksByUser,
  getBookByUser,
  addBookToUser,
} = require("../controllers/books");

router.get("/books", getBooks);
router.get("/books/:book_id", getBook);
router.post("/books", createBook);
router.patch("/books/:book_id", updateBook);
router.delete("/books/:book_id", deleteBook);

router.get("/users/:user_id/books", getBooksByUser);
router.get("/users/:user_id/books/:book_id", getBookByUser);
router.put("/users/:user_id/books/:book_id", addBookToUser);

module.exports = router;