require('@google/cloud-trace').start();
require('@google/cloud-debug');

const errors = require('@google/cloud-errors').start();
const express = require('express');
const swig = require('swig');
const path = require('path');
const favicon = require('serve-favicon');
const multer  = require('multer')
const fs = require('fs');
const logger = require('./logger');
const uuid = require('uuid');
const vision = require('@google-cloud/vision')({
  projectId: 'nodeinteractive',
  keyFilename: __dirname + '/keyfile.json'
});

const types = [ 'faces', 'landmarks', 'labels', 
                'logos', 'properties', 'safeSearch', 'text'];

// express setup
const app = express();
const upload = multer()
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(errors.express);

// show the index page
app.get('/', (req, res, next) => {
  res.render('index');
});

// find objects in the picture with the cloud vision API
app.post('/sendpic', upload.array(), (req, res, next) => {
  // grab the base64 encoded image from the request and save to disk
  let pic = req.body.pic;
  pic = pic.split("data:image/png;base64,")[1]

  // store the file on disk 
  stashFile(pic, (err, filePath) => {

    if (err) {
      res.status(500).send('Error acquiring image.');
      return next(err);
    }

    // use the cloud vision API to find stuff
    logger.info('analyzing the image...');
    vision.detect(filePath, types, (err, detections, apiResponse) => {

      if (err) {
        res.status(500).send('Error analyzing image.');
        return next(err);
      }

      logger.info('Image analysis complete!');
      logger.info(detections);

      // return the results to the browser
      res.json(detections);

      // clean up the image
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(`error cleaning up file ${filePath}`);
        }
      });
    });
  });
});

// This is a temporary work around until the Cloud Vision API
// supports streaming files directly.   
const stashFile = (data, callback) => {
  let buffer = new Buffer(data, 'base64');
  let filePath = path.join(__dirname, 'tmp', uuid());
  logger.info(`stashing file on disk at ${filePath}`);
  fs.writeFile(filePath, buffer, (err) => {
    callback(err, filePath);
  });
}

// Start the server
const server = app.listen(process.env.PORT || 8080, 
    '0.0.0.0', () => {
    console.log('App listening at http://%s:%s', 
        server.address().address,
        server.address().port);
    console.log('Press Ctrl+C to quit.');
});
