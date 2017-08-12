const express = require('express');
const router = express.Router();

// Define page routing
router.use('/page', require('./page'));

// [GET] /:index
router.get('/', (req, res) => {
  req.getConnection((err, connection) => {
    // Select the subterra database
    connection.query(`
      USE ${ process.env.DB_DATABASE }
    `, [], (err, log) => {

      // Retrieve all pages
      connection.query(`
        SELECT * FROM pages
      `, [], (err, pages) => {

        // Render index page
        res.render('index', {
          pages: pages
        });
      });
    });
  });
});

// [GET] /:not-found
router.get('/*', (req, res) => {
  res.render('error');
});

module.exports = router;
