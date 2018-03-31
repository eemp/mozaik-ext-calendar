const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');

const {google} = require('googleapis');
const calendar = google.calendar;

/**
 * Almanac class for communicating with Analytics via googleapis
 * @param {object} opts Options { serviceEmail: 'googleemail', serviceKey: 'pemkeycontents..' }
 */
class Almanac {

  constructor(jsonKey) {
    const auth = this.jwtClient = new google.auth.JWT(
      jsonKey.client_email,
      null,
      jsonKey.private_key,
      [
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      null
    );
    this.gapi = google.calendar({version: 'v3', auth});
  }

  authorize() {
    return new Promise((resolve, reject) => {
      this.jwtClient.authorize((err, tokens) =>{
        if (err) {
          console.warn('Failed to authenticate', err);
          return reject(err);
        }
        return resolve({ client: this.jwtClient, tokens: tokens });
      });
    });
  }

  /**
   * Internal method for making requests to Analytics
   * @param  {object} opts All the opts
   * @return {Promise}        Promise
   */
  readCalendar(opts) {
    opts = opts || {};
    var self = this;
    var events;

    opts.duration = opts.duration || 7;

    return new Promise((resolve, reject) => {
      if (!self.gapi || !self.gapi.events || self.gapi.events.length === 0) {
        return reject('Failed to initialise calendar client or no events');
      }

      self.gapi.events.list({
        calendarId: opts.calendar.id,
        //orderBy: 'startTime',
        timeMin: moment().format(),
        timeMax: moment().add(opts.duration, 'days').format(),
        maxResults: 1,
        auth: self.jwtClient
      }, (err, response) => {
        if (err) {
          reject(err);
        }

        if (!response.items || response.items.length === 0) {
          console.warn('No items found with calendarId:', opts.calendar.id);
          return resolve([]);
        }

        events = response.items.map((event) => {
          return {
            title: event.summary,
            body: event.description,
            calendar: {
              id: opts.calendar.id,
              name: response.summary,
              title: opts.calendar.title || response.summary
            },
            location: event.location,
            start: moment(event.start.dateTime).valueOf(),
            end: moment(event.end.dateTime).valueOf()
          };
        });

        resolve(events);
      });
    });
  }

  /**
   * Read calendar events from multiple calendars
   * @param  {object} opts All the params
   * @param  {array} opts.calendars Array of calendars where each entry has { title: 'name cal', id: '123123' }
   * @return {Promise}     Promise that resolves with events
   */
  readMultipleCalendars(opts) {
    const calendarPromises = opts.calendars.map((calendar) => {
      return this.readCalendar({ calendar: calendar });
    });

    return new Promise((resolve, reject) => {
      Promise.all(calendarPromises)
      .then((calendars) => {
        var events = calendars.reduce((arr, calendar) => {
          return arr.concat(calendar);
        })
        .filter((event) => {
          if (opts.location) {
            return event.location === opts.location;
          } else {
            return true;
          }
        })
        .sort((a, b) => {
          return a.start - b.start;
        });

        resolve(events);
      })
      .catch(reject);
    });
  }

}

module.exports = Almanac;
