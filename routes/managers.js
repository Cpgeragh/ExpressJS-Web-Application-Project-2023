const express = require('express');
const router = express.Router();

// Managers Page
router.get('/', async (req, res) => {
  try {
    const managers = await req.dao.getManagers();

    const html = `
      <h1>Managers (MongoDB) Page</h1>
      <a href="/managers/add">Add Manager (MongoDB)</a>
      <table border="1">
        <thead>
          <tr>
            <th>Manager ID</th>
            <th>Name</th>
            <th>Salary</th>
          </tr>
        </thead>
        <tbody>
          ${managers.map(manager => `
            <tr>
              <td>${manager._id}</td>
              <td>${manager.name}</td>
              <td>${manager.salary}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <a href="/">Back to Main Page</a>
    `;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/add', (req, res) => {
  res.send(`
    <h1>Add Manager</h1>
    <form action="/managers/add" method="post">
      <label for="mid">Manager ID (M followed by 3 numbers):</label>
      <input type="text" id="mid" name="mid" pattern="M[0-9]{3}" required><br>
      <label for="name">Name (at least five characters):</label>
      <input type="text" id="name" name="name" minlength="5" required><br>
      label for="salary">Salary (between 30000 and 70000):</label>
      <input type="number" id="salary" name="salary" min="30000" max="70000" step="0.01" required><br>
      <input type="submit" value="Add Manager">
    </form>
    <br>
    <a href="/managers">Back to Managers</a>
  `);
});

router.post('/add', async (req, res) => {
  const { mid, name} = req.body;
  const salary = parseFloat(req.body.salary);

  if (!/^M[0-9]{3}$/.test(mid)) {
    return res.send('Manager ID must be M followed by 3 numbers. <a href="/managers/add">Try again</a>');
  }

  // Validate Salary
  if (salary < 30000 || salary > 70000) {
    return res.send('Salary must be between 30000 and 70000. <a href="/managers/add">Try again</a>');
  }

  const existingManager = await req.dao.getManagerById(mid);
  if (existingManager) {
    return res.send('Manager ID already exists. <a href="/managers/add">Try again</a>');
  }

  try {
    await req.dao.addManager({ _id: mid, name, salary });
    res.redirect('/managers');
  } catch (error) {
    console.error('Error adding manager: ', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;