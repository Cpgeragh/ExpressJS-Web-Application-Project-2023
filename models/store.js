// models/store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: String,
  location: {
    type: String,
    required: true,
    minLength: 1,
  },
  managerId: String, // Use String instead of mongoose.Schema.Types.ObjectId
  // Add more fields as needed
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;