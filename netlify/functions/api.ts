import express, { Router } from 'express';
import serverless from 'serverless-http';
import ical from 'ical-generator';
import moment from 'moment';
import pkg from 'node-ical';

const api = express();

const router = Router();

function replaceQuotes(inputString) {
    return inputString.replace(/&#34;/g, '"');
  }
  
  router.get('/feed', async (req, res) => {
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

api.use('/', router);

export const handler = serverless(api);
