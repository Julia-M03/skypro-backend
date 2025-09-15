const User = require("../models/users");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getUsers = (req, res) => {
  return User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

const getUser = (req, res) => {
  const { user_id } = req.params;
  
  if (!isValidObjectId(user_id)) {
    return res.status(400).send({ error: "Invalid user_id" });
  }

  return User.findById(user_id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

const createUser = (req, res) => {
  return User.create({ ...req.body })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

const updateUser = (req, res) => {
  const { user_id } = req.params;
  
  if (!isValidObjectId(user_id)) {
    return res.status(400).send({ error: "Invalid user_id" });
  }

  return User.findByIdAndUpdate(user_id, { ...req.body }, { 
    new: true,
    runValidators: true 
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

const deleteUser = (req, res) => {
  const { user_id } = req.params;
  
  if (!isValidObjectId(user_id)) {
    return res.status(400).send({ error: "Invalid user_id" });
  }

  return User.findByIdAndDelete(user_id)
    .then((deleted) => {
      if (!deleted) {
        return res.status(404).send({ error: "User not found" });
      }
      res.status(204).send();
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};