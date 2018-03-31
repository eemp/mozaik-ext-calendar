const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const config = require('./config');
const Almanac = require('./almanac');

const client = mozaik => {

  mozaik.loadApiConfig(config);

  const configPath = config.get('calendar.googleServiceKeypath');
  const keyPath = configPath && path.resolve(path.normalize(configPath));
  const key = keyPath && require(keyPath);
  if (!key) {
    mozaik.logger.error('Failed to find calendar API JSON key file: %s -- ignoring API', keyPath);
    return {};
  }

  const almanac = new Almanac(key);

  return {
    events: (params) => {

      return almanac.authorize()
      .then(() => {
        return almanac.readMultipleCalendars({ calendars: params.calendars });
      })
      .then((events) => {
        return Promise.resolve(events);
      })
      .catch((err) => {
        console.warn('Failed to read calendar events', err.toString());
        return Promise.resolve([]);
      });

    }
  };

};

module.exports = client;
