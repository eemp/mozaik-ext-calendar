import _ from 'lodash';
import md5 from 'md5';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import CalendarIcon from 'react-icons/lib/fa/calendar'
import { TrapApiError, Widget, WidgetHeader, WidgetBody } from '@mozaik/ui';

import './Calendar.css';

function formatEventTimerange(event) {
  var start, end, now, diff;
  start = moment(event.start);
  end = moment(event.end);
  now = moment();
  diff = start.diff(now);
  if (diff < 0) {
    return `Ends ${end.fromNow()}`;
  } else {
    return `${start.calendar()} - ${end.format('LT')}`;
  }
};

class NextEvent extends Component {

  static getApiRequest(props) {
    // NOTE: Generating unique id from calendar names
    const calendarIds = _.map(props.calendars, calendar => calendar.id);
    const id = `calendar.events.${md5(calendarIds.join('-'))}`;

    return {
      id: id,
      params: {
        calendars: props.calendars
      }
    };
  }

  render() {
    const calendar = _.get(this.props, 'calendars.0');
    const {title, timerange, desc} = calendar;
    return (
        <Widget>
            <WidgetHeader title={calendar.title} icon={CalendarIcon} />
            <WidgetBody>
                <h2 className="calendar__title">{title}</h2>
                <div className="calendar__time-range">{timerange}</div>
                <p className="calendar__description">{desc}</p>
            </WidgetBody>
        </Widget>
    );

  }

}

NextEvent.propTypes = {
  //calendars: PropTypes.array.isRequired,
  calendars: PropTypes.array,
  ordinal: PropTypes.number
};

NextEvent.defaultProps = {
  title: 'Calendar'
};

export default NextEvent;
