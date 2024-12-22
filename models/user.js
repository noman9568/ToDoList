const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/');
const todolist = mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String
});


module.exports = mongoose.model('todolist',todolist);