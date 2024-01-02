const express = require('express');
const router = express.Router();
const dao = require('../dao').init(); // Import the dao

// Stores Page (GET /stores)
router.get('/', async (req, res) => {
  const query = 'SELECT * FROM store';
  
  const connection = await dao.getConnection();
  connection.query(query, (err, result) => {
    connection.release(); // Release the connection when you're done
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('stores', { stores: result });
    }
  });
});

// Edit Store Page (GET /stores/edit/:sid)
router.get('/edit/:sid', async (req, res) => {
  const sid = req.params.sid;
  const query = 'SELECT * FROM store WHERE sid = ?';
  
  const connection = await dao.getConnection();
  connection.query(query, [sid], (err, result) => {
    connection.release();
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length === 0) {
        res.status(404).send('Store not found');
      } else {
        const store = result[0];
        res.send(`
          <h1>Edit Store</h1>
          <form action="/stores/edit/${store.sid}" method="post">
            <label for="sid">SID:</label>
            <input type="text" id="sid" name="sid" value="${store.sid}" readonly><br>
            <label for="location">Location:</label>
            <input type="text" id="location" name="location" value="${store.location}" required><br>
            <label for="mgrid">Manager ID:</label>
            <input type="text" id="mgrid" name="mgrid" value="${store.mgrid}" required><br>
            <input type="submit" value="Update">
          </form>
          <br>
          <a href="/">Return Home</a>
        `);
      }
    }
  });
});

router.get('/add', (req, res) => {
  // Render the 'add store' form
  res.send(`
    <h1>Add Store</h1>
    <form action="/stores/add" method="post">
      <label for="sid">SID:</label>
      <input type="text" id="sid" name="sid" required><br>
      <label for="location">Location:</label>
      <input type="text" id="location" name="location" required><br>
      <label for="mgrid">Manager ID:</label>
      <input type="text" id="mgrid" name="mgrid" required><br>
      <input type="submit" value="Add Store">
    </form>
    <br>
    <a href="/stores">Back to Stores</a>
  `);
});

router.post('/add', async (req, res) => {
  const { sid, location, mgrid } = req.body;

  // Validate SID
if (!/^.{5}$/.test(sid)) {
  return res.send('SID must be exactly 5 characters. <a href="/stores/add">Try again</a>');
}

  // Validate location
  if (location.length < 1) {
    return res.send('Location must have more than one character. <a href="/stores/add">Try again</a>');
  }

  const connection = await dao.getConnection();

  // Check if SID already exists in MySQL
  const sidQuery = 'SELECT * FROM store WHERE sid = ?';
  connection.query(sidQuery, [sid], async (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length > 0) {
        return res.send('SID ' + sid + ' already exists. <a href="/stores/add">Try again</a>');
      }

      // Check if manager ID exists in MongoDB and is not managing another store
      const manager = await dao.getManagerById(mgrid);
      if (!manager) {
        return res.send('Manager ' + mgrid + ' doesn\'t exist in MongoDB. <a href="/stores/add">Try again</a>');
      }

      const checkQuery = 'SELECT * FROM store WHERE mgrid = ?';
      connection.query(checkQuery, [mgrid], async (err, result) => {
        if (err) {
          console.error('Error executing MySQL query: ', err);
          res.status(500).send('Internal Server Error');
        } else {
          if (result.length > 0) {
            return res.send('Manager ' + mgrid + ' already managing another store. <a href="/stores/add">Try again</a>');
          }

          // Insert new store into MySQL
          const insertQuery = 'INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?)';
          connection.query(insertQuery, [sid, location, mgrid], (err, result) => {
            connection.release();
            if (err) {
              console.error('Error inserting store in MySQL: ', err);
              res.status(500).send('Internal Server Error');
            } else {
              res.redirect('/stores');
            }
          });
        }
      });
    }
  });
});

// Handle Edit Store (POST /stores/edit/:sid)
router.post('/edit/:sid', async (req, res) => {
  const sid = req.params.sid;
  const { location, mgrid } = req.body;

  // Validate location
  if (location.length < 1) {
    return res.send('Location must have more than one character. <a href="/stores/edit/' + sid + '">Try again</a>');
  }

  // Validate manager ID
  if (mgrid.length !== 4) {
    return res.send('Manager ID must only have 4 characters. <a href="/stores/edit/' + sid + '">Try again</a>');
  }

  const connection = await dao.getConnection();

  const checkQuery = 'SELECT * FROM store WHERE mgrid = ? AND sid != ?';
connection.query(checkQuery, [mgrid, sid], async (err, result) => {
  if (err) {
    console.error('Error executing MySQL query: ', err);
    res.status(500).send('Internal Server Error');
  } else {
    if (result.length > 0) {
      return res.send('Manager ' + mgrid + ' already managing another store. <a href="/stores/edit/' + sid + '">Try again</a>');
    }

    // Check if manager ID exists in MongoDB
    const manager = await dao.getManagerById(mgrid);
    if (!manager) {
      return res.send('Manager ' + mgrid + ' doesn\'t exist in MongoDB. <a href="/stores/edit/' + sid + '">Try again</a>');
    }

    // Update store in MySQL
    const updateQuery = 'UPDATE store SET location = ?, mgrid = ? WHERE sid = ?';
    connection.query(updateQuery, [location, mgrid, sid], (err, result) => {
      connection.release();
      if (err) {
        console.error('Error updating store in MySQL: ', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect('/stores');
      }
    }); // Closing parenthesis for connection.query()
  } // Closing bracket for the callback function passed to connection.query()
}); // Closing parenthesis for connection.query()
});

module.exports = router;