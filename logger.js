const winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      handleExceptions: true
    })
  ]
});

module.exports = logger;