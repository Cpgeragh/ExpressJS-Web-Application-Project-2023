const express = require('express');
const router = express.Router();
const dao = require('../dao').init(); // Import the dao

// Products Page (GET /products)
router.get('/', async (req, res) => {
  const query = `
    SELECT product.pid, product.productdesc, product.supplier, product_store.sid, store.location, product_store.price
    FROM product
    LEFT JOIN product_store ON product.pid = product_store.pid
    LEFT JOIN store ON product_store.sid = store.sid
  `;

  const connection = await dao.getConnection();
  connection.query(query, (err, result) => {
    connection.release(); // Release the connection when you're done
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('products', { products: result }); // Render the products.ejs template with the query result
    }
  });
});

// Delete Product Page (GET /products/delete/:pid)
router.get('/delete/:pid', async (req, res) => {
  const productId = req.params.pid;
  const checkQuery = 'SELECT * FROM product_store WHERE pid = ?';

  // Check if the product is sold in any store
  const connection = await dao.getConnection();
  connection.query(checkQuery, [productId], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking product in MySQL: ', checkErr);
      res.status(500).send('Internal Server Error');
    } else {
      if (checkResult.length === 0) {
        // Product is not sold in any store, proceed with deletion
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
        // Product is sold in stores, show error message
        const productNameQuery = 'SELECT productdesc FROM product WHERE pid = ?';

        connection.query(productNameQuery, [productId], (nameErr, nameResult) => {
          connection.release(); // Release the connection when you're done
          if (nameErr) {
            console.error('Error getting product name from MySQL: ', nameErr);
            res.status(500).send('Internal Server Error');
          } else {
            const productName = nameResult.length > 0 ? nameResult[0].productdesc : 'Unknown Product';
            res.status(400).send(`Error: "${productName}" is currently in stores and cannot be deleted. <a href="/products">Try Again</a>`);
          }
        });
      }
    }
  });
});

module.exports = router;