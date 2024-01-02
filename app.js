const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// MongoDB DAO initialization
const mongoDAO = require('./dao');
const dao = mongoDAO.init();

// Middleware to add the MongoDB DAO to each request
app.use((req, res, next) => {
  req.dao = dao;
  next();
});

// Routes
const storesRouter = require('./routes/stores');
const productsRouter = require('./routes/products');
const managersRouter = require('./routes/managers');

app.use('/stores', storesRouter);
app.use('/products', productsRouter);
app.use('/managers', managersRouter);

// Home Page
app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

// Example route to find all documents
app.get('/find', (req, res) => {
  req.dao.findAll()
    .then((documents) => {
      // Process documents
      res.send(`Found ${documents.length} documents: ${JSON.stringify(documents)}`);
    })
    .catch((error) => {
      // Handle error
      console.error('Error retrieving documents:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});