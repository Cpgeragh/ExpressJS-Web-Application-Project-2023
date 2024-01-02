// Stores.js Schema
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: String,
  location: {
    type: String,
    required: true,
    minLength: 1,
  },
  // Use String instead of mongoose.Schema.Types.ObjectId Since I want to Retrieve ManagerID which is not an ObjectID
  managerId: String, 
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;