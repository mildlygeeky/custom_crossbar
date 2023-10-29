// app.mjs
import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

function trimTeamTitle(teamTitle) {
  return teamTitle.split(" U12")[0];
}

app.get('/', async (req, res) => {
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
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

