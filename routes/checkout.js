var express = require('express');
var router = express.Router();

/* GET checkout page. */
router.get('/', function(req, res, next) {
  console.log(`The session id is: ${req.session.userId}`);
  res.render('checkout', { title: 'Checkout' });
});

module.exports = router;
