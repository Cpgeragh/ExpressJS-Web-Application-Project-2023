//Mangers.js Schema
const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  name: String,

});

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;