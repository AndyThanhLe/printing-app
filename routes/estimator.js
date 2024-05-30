const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  }, 
  filename: function (req, file, cb) {
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file.originalname)[1];
    if (ext == undefined || ext != 'stl') {
      cb(new Error('The file is not an stl file!'));
    }
    else {
      // would it be worth it to perform some kind of encryption and use a dictionary or something to hide the data

      // cb(null, `${Date.now()}.stl`);
      cb(null, `${file.originalname}`);
    }
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
  res.json({
    fileName: req.file.originalname
  });
});

module.exports = router;
