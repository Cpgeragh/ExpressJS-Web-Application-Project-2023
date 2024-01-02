// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  description: String,
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  price: Number,
  // Add more fields as needed
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;