const mongoose = require("mongoose");
const Book = require("../models/books");
const UserBooks = require("../models/usersBooks");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const getBookId = (req) => req.params.book_id || req.query.book_id;

const handleError = (res, status, message) => {
  res.status(status).send({ error: message });
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.status(200).send(books);
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

const getBook = async (req, res) => {
  const book_id = getBookId(req);
  
  if (!isValidObjectId(book_id)) {
    return handleError(res, 400, "Invalid book_id");
  }

  try {
    const book = await Book.findById(book_id);
    if (!book) {
      return handleError(res, 404, "Book not found");
    }
    res.status(200).send(book);
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

const createBook = async (req, res) => {
  try {
    const book = await Book.create({ ...req.body });
    res.status(201).send(book);
  } catch (err) {
    if (err.code === 11000) {
      handleError(res, 400, "Book with this ISBN already exists");
    } else {
      handleError(res, 500, err.message);
    }
  }
};

const updateBook = async (req, res) => {
  const book_id = getBookId(req);
  
  if (!isValidObjectId(book_id)) {
    return handleError(res, 400, "Invalid book_id");
  }

  try {
    const book = await Book.findByIdAndUpdate(
      book_id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return handleError(res, 404, "Book not found");
    }
    res.status(200).send(book);
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

const deleteBook = async (req, res) => {
  const book_id = getBookId(req);
  
  if (!isValidObjectId(book_id)) {
    return handleError(res, 400, "Invalid book_id");
  }

  try {
    const deleted = await Book.findByIdAndDelete(book_id);
    if (!deleted) {
      return handleError(res, 404, "Book not found");
    }
    
    await UserBooks.deleteMany({ bookId: book_id });
    
    res.status(204).send();
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

const getBooksByUser = async (req, res) => {
  const { user_id } = req.params;
  
  if (!isValidObjectId(user_id)) {
    return handleError(res, 400, "Invalid user_id");
  }

  try {
    const userBooks = await UserBooks.find({ userId: user_id })
      .populate('bookId')
      .exec();
    
    const books = userBooks.map(ub => ub.bookId);
    res.status(200).send(books);
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

const addBookToUser = async (req, res) => {
  const { user_id, book_id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ["reading", "completed", "wishlist"];

  if (!isValidObjectId(user_id) || !isValidObjectId(book_id)) {
    return handleError(res, 400, "Invalid user_id or book_id");
  }

  if (status && !allowedStatuses.includes(status)) {
    return handleError(res, 400, `Invalid status. Allowed: ${allowedStatuses.join(", ")}`);
  }

  try {
    const [book, user] = await Promise.all([
      Book.findById(book_id),
      mongoose.model("User").findById(user_id)
    ]);

    if (!book) return handleError(res, 404, "Book not found");
    if (!user) return handleError(res, 404, "User not found");

    if (book.availableCopies <= 0) {
      return handleError(res, 400, "No available copies of this book");
    }

    const updateData = status ? { status } : {};
    const userBook = await UserBooks.findOneAndUpdate(
      { userId: user_id, bookId: book_id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).populate('bookId');

    if (userBook.isNew) {
      await Book.findByIdAndUpdate(book_id, { 
        $inc: { availableCopies: -1 } 
      });
    }

    res.status(userBook.isNew ? 201 : 200).send(userBook);
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

const getBookByUser = async (req, res) => {
  const { user_id, book_id } = req.params;
  
  if (!isValidObjectId(user_id) || !isValidObjectId(book_id)) {
    return handleError(res, 400, "Invalid user_id or book_id");
  }

  try {
    const userBook = await UserBooks.findOne({ 
      userId: user_id, 
      bookId: book_id 
    }).populate("bookId");
    
    if (!userBook) {
      return handleError(res, 404, "Book not found for this user");
    }
    res.status(200).send(userBook.bookId);
  } catch (err) {
    handleError(res, 500, err.message);
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getBooksByUser,
  getBookByUser,
  addBookToUser
};