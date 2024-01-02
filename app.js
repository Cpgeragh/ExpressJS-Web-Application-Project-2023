const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Set EJS as View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to Parse Request Body
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to JSON Request Body
app.use(bodyParser.json());

// MongoDB DAO Initialization
const mongoDAO = require('./dao');
const dao = mongoDAO.init();

// Middleware to Add MongoDB DAO to Each Request
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});