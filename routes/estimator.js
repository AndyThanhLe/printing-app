const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Declare variables
stls = {}


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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
  stls
  res.json({
    fileName: path.parse(req.file.filename).name,
  });
});

/* DELETE file removal */
router.delete('/remove', (req, res, next) => {
  console.log(req.body.id);

  // TODO: delete file from the server!

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
