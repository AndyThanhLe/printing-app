const express = require('express');
const router = express.Router();

/* GET cart page. */
router.get('/', function(req, res, next) {
  console.log(`The session id is: ${req.session.userId}`);
  res.render('cart', { title: 'Cart' });
});

module.exports = router;

