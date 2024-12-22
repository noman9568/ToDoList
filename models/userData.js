const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/');
const userData = mongoose.Schema({
  username: String,
  description: String
});


module.exports = mongoose.model('userData',userData);