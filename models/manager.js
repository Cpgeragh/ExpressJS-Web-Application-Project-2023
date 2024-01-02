// models/manager.js
const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  name: String,
  // Add more fields as needed
});

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;