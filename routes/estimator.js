const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { MongoClient } = require('mongodb');


// Declare variables and constants



// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.env.MODEL_UPLOAD_DIRECTORY, req.session.userId));
  }, 
  filename: (req, file, cb) => {
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file.originalname)[1];
    if (ext == undefined || ext != 'stl') {
      cb(new Error('The file is not an stl file!'));
    }
    else {
      cb(null, `${Date.now()}.stl`);
    }
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100000000 },
});


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // directory the user's uploaded files will be stored at
    let dir = path.join(process.env.MODEL_UPLOAD_DIRECTORY, req.session.userId);
    
    try {
      await fs.stat(dir);
    }
    catch (_) {
      await fs.mkdir(dir);
    }

    res.render('estimator', { title: 'Estimator' });
  }
  catch (e) {
    next(e);
  }
});

router.get('/get-session-id', (req, res, next) => {
  res.json({
    sessionId: req.session.userId,
  });
});


/* PUT file submission */
router.put('/upload', upload.single('stl-file'), (req, res, next) => {
  res.json({
    fileName: req.file.filename,
    modelName: req.file.originalname,
  });
});


/* DELETE file removal */
router.delete('/remove', async (req, res, next) => {
  try {
    await fs.unlink(path.join(process.env.MODEL_UPLOAD_DIRECTORY, req.session.userId, req.body.id), (error) => {
      if (error) {
        throw error;
      }
      console.log(`'${req.body.id}' has been deleted!`);
    });
  
    res.json({
      success: true,
    })
  }
  catch (e) {
    next(e);
  }
});


/* POST form submission */
router.post('/submit', (req, res, next) => {
  // Add to session data...
  console.log(req.body.material);
  console.log(req.body.colour);
  console.log(req.body.infill);
  console.log(req.body.quantity);

  // return the number of cart items...
  // this will be tracked in the session data...

  // send back data on where to redirect
  res.json({
    'redirect': '../'
  });
});


router.get('/get-model/:fileName', (req, res, next) => {
  res.json({
    'filePath': path.join('..', 'models', req.session.userId, req.params.fileName),
  });
});


router.get('/get-materials', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
  const materials = [];

  try {
    await client.connect();

    const db = client.db(process.env.MONGODB_DATABASE_NAME);

    const cursor = db.collection('filaments').aggregate([
      {
        $group: {
          _id: { 'material': '$material' }
        }
      },
      {
        $sort: { '_id.material': 1 }
      }
    ]);

    for await (const document of cursor) {
      materials.push(document._id.material);
    }
  }
  catch (e) {
    materials = [];
    console.error(e);
  }
  finally {
    await client.close();
  }

  res.json({
    materials: materials,
  });
});

router.post('/get-colours', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
  const colours = [];

  try {
    await client.connect();

    const db = client.db(process.env.MONGODB_DATABASE_NAME);

    const cursor = db.collection('filaments').aggregate([
      {
        $match: { material: req.body.material }
      },
      {
        $group: {
          _id: { colourName: '$colourName', colourHex: '$colourHex' }
        }
      },
      {
        $sort: { '_id.colourName': 1 }
      },
    ]);

    for await (const document of cursor) {
      colours.push({
        colourName: document._id.colourName,
        colourHex: document._id.colourHex,
      });
    }
  }
  catch (e) {
    colours = [];
    console.error(e);
  }
  finally {
    await client.close();
  }

  res.json({
    colours: colours,
  });
});


router.get('/get-config-options', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
  let optionMapping = {};
  
  try {
    await client.connect();

    const db = client.db(process.env.MONGODB_DATABASE_NAME);

    const cursor = db.collection('filaments').aggregate([
      {
        $sort: {
          colourName: 1,
        }
      },
      {
        $group: {
          _id: '$material',
          colours: {
            $push: { colourName: '$colourName', colourHex: '$colourHex', }
          },
        }
      },
      {
        $sort: {
          _id: 1,
        }
      }
    ]);

    for await (const document of cursor) {
      optionMapping[document._id] = document.colours;
    }

    console.log(optionMapping);
  }
  catch (e) {
    optionMapping = {};
    console.error(e);
  }
  finally {
    client.close();
  }

  res.json(optionMapping);
});


module.exports = router;
