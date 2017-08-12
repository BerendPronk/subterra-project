const dotenv = require('dotenv').config();
const subterra = require('subterra');
const express = require('express');
const app = express();

// Define view paths
let viewArray = [
  __dirname + '/views'
];

// Configure subterra
subterra.config({
  application: app,
  views: viewArray
});

// Define static-file serving
app.use('/', express.static(__dirname + '/'));

// Set view engine to EJS
app.set('view engine', 'ejs').set('views', viewArray);

// Define app routing
app.use('/', require('./routes/main'));

// Run the application
app.listen(process.env.PORT || 3000, () => {
  console.log('Server started');
});
