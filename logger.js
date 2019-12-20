const bunyan = require('bunyan');
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');
const loggingBunyan = new LoggingBunyan();
const logger = bunyan.createLogger({
  name: 'node-cloud-visionator',
  level: 'info',
  streams: [{ stream: process.stdout }, loggingBunyan.stream()]
});

module.exports = logger;
