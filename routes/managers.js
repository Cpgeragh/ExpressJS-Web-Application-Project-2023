const express = require('express');
const router = express.Router();

// Fetches List of Managers and Sends to View Template
router.get('/', async (req, res) => {
  try {
    const managers = await req.dao.getManagers();
    res.render('managers', { managers: managers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Add Manager Web Page View
router.get('/add', (req, res) => {
  res.render('addManager');
});

// Add Manager to Database
router.post('/add', async (req, res) => {
  const { mid, name } = req.body;
  const salary = parseFloat(req.body.salary);

  // Validates ID Layout Parameters
  if (!/^M[0-9]{3}$/.test(mid)) {
    return res.send('Manager ID must be M followed by 3 numbers. <a href="/managers/add">Try again</a>');
  }

  // Validate Salary Parameters
  if (salary < 30000 || salary > 70000) {
    return res.send('Salary must be between 30000 and 70000. <a href="/managers/add">Try again</a>');
  }

  // Validates ID Storage Parameters
  const existingManager = await req.dao.getManagerById(mid);
  if (existingManager) {
    return res.send('Manager ID already exists. <a href="/managers/add">Try again</a>');
  }

  // Adds Manager to Database if Parameters Meet Requirements 
  try {
    await req.dao.addManager({ _id: mid, name, salary });
    res.redirect('/managers');
  } catch (error) {
    console.error('Error adding manager: ', error);
    res.status(500).send('Internal Server Error');
  }
});

// Exports Router
module.exports = router;