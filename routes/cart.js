var express = require('express');
var router = express.Router();

/* GET cart page. */
router.get('/', function(req, res, next) {
  console.log(`The session id is: ${req.session.userId}`);
  res.render('cart', { title: 'cart' });
});

module.exports = router;
