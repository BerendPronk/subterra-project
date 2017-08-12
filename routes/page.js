const express = require('express');
const router = express.Router();

// [GET] /page/:id
router.get('/:id', (req, res) => {
  req.getConnection((err, connection) => {
    // Select the subterra database
    connection.query(`
      USE ${ process.env.DB_DATABASE }
    `, [], (err, log) => {

      // Retrieve all page data
      connection.query(`
        SELECT * FROM pages
        WHERE id = ${ req.params.id }
      `, [], (err, pages) => {
        const page = pages[0];

        // Check if page exists
        if (page) {
          // Page menu specific variables
          const pageMenus = page.menus.split(',');
          let menuChildren = [];

          // Will store ordered HTML content
          let contentBlocks = [];

          // Process page content to HTML
          page.content.split('|-|').forEach(block => {
            switch (block.charAt(1)) {
              case 'H':
                contentBlocks.push(`
                  <h3>${ block.replace('|H|', '') }</h3>
                `);
              break;
              case 'P':
                contentBlocks.push(`
                  <p>${ block.replace('|P|', '').replace(/\n/g, '<br>') }</p>
                `);
              break;
              case 'I':
                contentBlocks.push(`
                  <img src="/media/${ block.replace('|I|', '') }" alt="Image about ${ page.title }" onclick="modal.open()">
                `);
              break;
              case 'L':
                const listContent = block.replace('|L|', '').split('|');
                const listName = listContent[0];
                const list = listContent[1].split(',').filter(e => {
                  // Removes empty data fields
                  return e;
                });
                let listString = '';

                // Give HTML to each item in list
                list.forEach(item => {
                  listString += `
                    <li>
                      ${ item }
                    </li>
                  `;
                });

                contentBlocks.push(`
                  <h3>${ listName }</h3>
                  <ul>
                    ${ listString }
                  </ul>
                `);
              break;
              case 'E':
                const host = block.replace('|E|', '');

                // Check source of embedded video
                if (host.indexOf('youtube.com') !== -1) {
                  contentBlocks.push(`
                    <iframe width="640" height="360" src="https://www.youtube.com/embed/${ host.split('.com/watch?v=')[1] }" frameborder="0" allowfullscreen></iframe>
                  `);
                } else if (host.indexOf('vimeo.com') !== -1) {
                  contentBlocks.push(`
                    <iframe width="640" height="360" src="https://player.vimeo.com/video/${ host.split('.com/')[1].replace('/', '') }" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                  `);
                } else {
                  contentBlocks.push(`
                    <a href="${ host }" class="button">Watch video</a>
                  `)
                }
              break;
              case 'B':
                const buttonContent = block.replace('|B|', '').split('|');
                const buttonName = buttonContent[0];
                const buttonAnchor = buttonContent[1].split('-')[0];

                contentBlocks.push(`
                  <a href="/page/${ buttonAnchor }" class="button">${ buttonName }</a>
                `);
              break;
            }
          });

          // Fetch all menus from database
          connection.query(`
            SELECT * FROM menus
          `, [], (err, menus) => {

            // Fetch all pages from database
            connection.query(`
              SELECT * FROM pages
            `, [], (err, pages) => {

              // Pushes array of each page menu's children
              pageMenus.forEach(pageMenu => {
                menus.forEach(menu => {
                  if (menu.name === pageMenu) {
                    const children = menu.children.split(',');
                    let pageData = [];

                    // Retrieve type from children
                    children.forEach(child => {
                      pages.forEach(page => {
                        if (page.title === child) {
                          // Push both type and title in array
                          pageData.push({
                            id: page.id,
                            type: page.type,
                            title: child
                          });
                        }
                      });
                    });

                    // Add page data array to menu chidlren array
                    menuChildren.push(pageData);
                  }
                });
              });

              // Render page view
              res.render('page', {
                pathname: '/page',
                page: {
                  id: page.id,
                  category: page.category,
                  type: page.type.replace(/ /g, '-'),
                  title: page.title,
                  menus: pageMenus.filter(e => {
                    // Removes empty data fields
                    return e;
                  }),
                  menuChildren: menuChildren,
                  content: contentBlocks
                }
              });
            });
          });
        } else {
          // Render error page
          res.render('error');
        }
      });
    });
  });
});

module.exports = router;
