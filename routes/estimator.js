const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  }, 
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100000000 },
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('estimator', { title: 'Estimator' });
});


/* File submission */
router.post('/upload', upload.single('stl-file'), function(req, res, next) {
  console.log(`Uploaded file '${req.file.originalname}'!`);
  res.json({
    fileName: req.file.originalname
  });
});

module.exports = router;
