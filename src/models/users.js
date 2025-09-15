const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    minLength: 2,
    trim: true
  },
  userName: { 
    type: String, 
    required: true, 
    unique: true, 
    minLength: 5,
    trim: true
  },
  surname: { 
    type: String, 
    required: true, 
    minLength: 2,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: true 
  },
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  borrowedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }]
});

const User = mongoose.model("User", userSchema);

module.exports = User;