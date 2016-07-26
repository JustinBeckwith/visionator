'use strict';

require('@google/cloud-trace').start();
require('@google/cloud-debug');

const errors = require('@google/cloud-errors')();
const express = require('express');
const swig = require('swig');
const path = require('path');
const favicon = require('serve-favicon');
const multer  = require('multer')
const gcloud = require('gcloud');
const fs = require('fs');
const logger = require('./logger');
const uuid = require('node-uuid');

// use the vision API
const vision = gcloud.vision();
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
app.use(errors.express);

// show the index page
app.get('/', (req, res, next) => {
  res.render('index');
});

// find objects in the picture with the cloud vision API
app.post('/sendpic', upload.array(), (req, res, next) => {
  // grab the base64 encoded image from the request and save to disk
  let pic = req.body.pic;
  let buffer = new Buffer(pic, 'base64');
  fs.writeFile('/tmp')

  logger.info(pic.length);
  //pic = pic.split("data:image/png;base64,")[1]
  //console.log(pic);
  
  vision.detect(pic, types, (err, detections, apiResponse) => {
    if (err) {
      logger.error('error analyzing image...');
      res.status(500).send('Error analyzing image.');
      return next(err);
    }
    logger.info('got it!');
    logger.info(detections);

    // return the results to the browser
    res.json(detections);
  });
});

// Start the server
const server = app.listen(process.env.PORT || 8080, 
    '0.0.0.0', () => {
    console.log('App listening at http://%s:%s', 
        server.address().address,
        server.address().port);
    console.log('Press Ctrl+C to quit.');
});
