// Products.js Schema
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  description: String,
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  price: Number,

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;