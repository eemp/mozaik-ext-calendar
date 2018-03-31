const convict = require('convict');

const config = convict({
  calendar: {
    googleServiceKeypath: {
      doc: 'Absolute path to service account .PEM file',
      default: null,
      format: String,
      env: 'GOOGLE_SERVICE_KEYPATH'
    }
  }
});

module.exports = config;
