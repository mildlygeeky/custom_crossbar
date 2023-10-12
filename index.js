'use strict';

import ical from 'ical-generator';
import moment from 'moment';
import express from 'express';
import pkg from 'node-ical';

const app = express();

function replaceQuotes(inputString) {
  return inputString.replace(/&#34;/g, '"');
}

app.get('/', async (req, res) => {
  try {
    const crossbar_events = await pkg.async.fromURL('https://www.accounts.crossbar.org/calendar/ical/49638');

    const filteredEvents = Object.values(crossbar_events).filter((event) => {
      return (event.type === 'VEVENT' && (!event.summary.includes("U10")) && (!event.summary.includes("Squirt  A (4) Practice")));
    });

    const cal = ical({
      prodId: '//crossbar.mildlygeeky.com//ical-generator//EN',
      events: filteredEvents.map((event) => ({
        start: moment(event.start),
        end: moment(event.end),
        summary: replaceQuotes(event.summary),
        location: event.location,
        description: event.description,
        url: event.url,
      })),
    });

    cal.serve(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
