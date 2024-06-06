const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Declare variables and constants


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.MODEL_UPLOAD_DIRECTORY);
  }, 
  filename: (req, file, cb) => {
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file.originalname)[1];
    if (ext == undefined || ext != 'stl') {
      cb(new Error('The file is not an stl file!'));
    }
    else {
      // would it be worth it to perform some kind of encryption and use a dictionary or something to hide the data

      cb(null, `${Date.now()}.stl`);
      // cb(null, `${file.originalname}`);
    }
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100000000 },
});


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('estimator', { title: 'Estimator' });
});

/* PUT file submission */
router.put('/upload', upload.single('stl-file'), (req, res, next) => {
  res.json({
    fileName: req.file.filename,
  });
});

/* DELETE file removal */
router.delete('/remove', (req, res, next) => {
  console.log(req.body.id);

  // TODO: delete file from the server!
  fs.unlink(`${process.env.MODEL_UPLOAD_DIRECTORY}${req.body.id}`, (error) => {
    if (error) {
      throw error;
    }
    console.log(`'${req.body.id}' has been deleted!`);
  });

  res.json({
    success: true,
  })
});



/* POST form submission */
router.post('/submit', (req, res, next) => {
  console.log(req.body.material);
  console.log(req.body.colour);
  console.log(req.body.printer);
  console.log(req.body.infill);

  // send back data on where to redirect
  res.redirect('../');
})

module.exports = router;
