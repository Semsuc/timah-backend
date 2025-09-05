const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create write stream
const logStream = fs.createWriteStream(
  path.join(__dirname, '../../logs/http.log'),
  { flags: 'a' }
);

// Use 'combined' format for production logging
const httpLogger = morgan('combined', { stream: logStream });

module.exports = httpLogger;
