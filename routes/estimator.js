const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const modelDir = 'public/models/';

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, modelDir);
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
    fileName: path.parse(req.file.filename).name,
    stlName: req.file.originalname.replace(/\.stl$/, ''),
  });
});

/* DELETE file removal */
router.delete('/remove', (req, res, next) => {
  console.log(req.body.id);

  // TODO: delete file from the server!
  fs.unlink(`${modelDir}${req.body.id}.stl`, (error) => {
    if (error) {
      throw error;
    }
    console.log(`'${req.body.id}.stl' has been deleted!`);
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
