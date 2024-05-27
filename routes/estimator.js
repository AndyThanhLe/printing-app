const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'temp/' });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('estimator', { title: 'Estimator' });
});


/* form submission page. */
router.post('/upload', upload.single('stl_file'), function(req, res, next) {
  console.log(req.file, req.body);
  res.json({ message: 'File uploaded successfully!' });
});

module.exports = router;
