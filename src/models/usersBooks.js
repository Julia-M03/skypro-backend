const mongoose = require("mongoose");

const userBooksSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Book", 
    required: true 
  },
  status: {
    type: String,
    enum: ["reading", "completed", "wishlist"],
    default: "reading"
  },
  borrowedDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date
  }
}, {
  timestamps: true
});

userBooksSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const UserBooks = mongoose.model("UserBooks", userBooksSchema);

module.exports = UserBooks;