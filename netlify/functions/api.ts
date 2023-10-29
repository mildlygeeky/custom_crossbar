import express, { Router } from 'express'
import serverless from 'serverless-http'
import ical from 'ical-generator'
import moment from 'moment'
import pkg from 'node-ical'
import axios from 'axios'

const api = express()

const router = Router()

function replaceQuotes(inputString) {
  return inputString.replace(/&#34;/g, '"')
}

function trimTeamTitle(teamTitle) {
  return teamTitle.split(" U12")[0];
}

app.get('/hockey', async (req, res) => {
  try {
    const response = await axios.get('https://gamesheetstats.com/api/useStandings/getDivisionStandings/3864?filter[divisions]=22290&filter[gametype]=overall&filter[limit]=1&filter[offset]=0');
    const tableData = response.data[0].tableData;
    const transformedData = [];

    for (let i = 0; i < tableData.ranks.length; i++) {
      transformedData.push({
        rank: tableData.ranks[i],
        teamName: trimTeamTitle(tableData.teamTitles[i].title),
        gamesPlayed: tableData.gp[i],
        wins: tableData.w[i],
        losses: tableData.l[i],
        ties: tableData.t[i],
        points: tableData.pts[i],
        goalsFor: tableData.gf[i],
        goalsAgainst: tableData.ga[i],
        diff: tableData.diff[i],
        powerPlayGoals: tableData.ppg[i],
        shortHandedGoals: tableData.shg[i],
        powerPlayGoalsAgainst: tableData.ppga[i],
        penaltyInfractionMinutes: tableData.pim[i],
        winPercentage: tableData.ppct[i] 
      });
    }

    res.json(transformedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' })
  }
})

router.get('/feed', async (req, res) => {
  try {
    const crossbar_events = await pkg.async.fromURL('https://www.accounts.crossbar.org/calendar/ical/49638')
  
    const filteredEvents = Object.values(crossbar_events).filter((event) => {
      return (event.type === 'VEVENT' && (!event.summary.includes("U10")) && (!event.summary.includes("Squirt  A (4) Practice")))
    })
  
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
    })
  
    cal.serve(res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

api.use('/', router)

export const handler = serverless(api)
