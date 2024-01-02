const express = require('express');
const router = express.Router();
const dao = require('../dao').init();

// Fetches List of Products and Sends to View Template
router.get('/', async (req, res) => {
  const query = `
    SELECT product.pid, product.productdesc, product.supplier, product_store.sid, store.location, product_store.price
    FROM product
    LEFT JOIN product_store ON product.pid = product_store.pid
    LEFT JOIN store ON product_store.sid = store.sid
  `;

  // Accesses Mysql Database
  const connection = await dao.getConnection();
  connection.query(query, (err, result) => {
    connection.release();
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('products', { products: result });
    }
  });
});

// Delete Product Page View
router.get('/delete/:pid', async (req, res) => {
  const productId = req.params.pid;
  const checkQuery = 'SELECT * FROM product_store WHERE pid = ?';

  // Checks if Product Currently Sold in Any Store
  const connection = await dao.getConnection();
  connection.query(checkQuery, [productId], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking product in MySQL: ', checkErr);
      res.status(500).send('Internal Server Error');
    } else {
      // Product is Not Sold in Any Store, Proceed With Deletion
      if (checkResult.length === 0) {
        const deleteQuery = 'DELETE FROM product WHERE pid = ?';

        connection.query(deleteQuery, [productId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error('Error deleting product in MySQL: ', deleteErr);
            res.status(500).send('Internal Server Error');
          } else {
            res.redirect('/products');
          }
        });
      } else {
        // Product Sold in Stores, Show Error Message
        const productNameQuery = 'SELECT productdesc FROM product WHERE pid = ?';

        connection.query(productNameQuery, [productId], (nameErr, nameResult) => {
          connection.release();
          if (nameErr) {
            console.error('Error getting product name from MySQL: ', nameErr);
            res.status(500).send('Internal Server Error');
          } else {
            const productName = nameResult.length > 0 ? nameResult[0].productdesc : 'Unknown Product';
            res.status(400).send(`Error: ${productName} is currently in stores and cannot be deleted. <a href="/products">Try Again</a>`);
          }
        });
      }
    }
  });
});

// Exports Router
module.exports = router;