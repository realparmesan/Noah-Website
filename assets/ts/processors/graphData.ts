import { getGoalsData, gameData, getSquadData  } from "../apiQueries";
import * as _ from 'lodash';

export type chartData = {
    label: string,
    fill: boolean,
    data: matchGoals[]
  };

  
export type matchGoals = {
    t: Date,
    goals: number,
    y: number
  };

export let parsePlayerData = async function () {
    let data = await getGoalsData();
    let scorers = _.map(_.flatten(_.map(data, "scorers")), "scorer");
    let squadData = await getSquadData();
  
    scorers = scorers.concat(squadData.players);
    let scorerNames = _.uniq(scorers);
  
    let playerData = scorerNames.map(name => {
      let record: chartData = {
        "label": name,
        "fill": false,
        "data": []
      }
      return record;
    });
  
    data = data.sort((a, b) => {
      return a.date.getTime() - b.date.getTime()
    })
  
    data.forEach(game => {
      scorerNames.forEach((scorer) => {
        let playerIndex = playerData.findIndex(e => e.label == scorer)
        let scorerIndex = game.scorers.findIndex(e => e.scorer == scorer)
  
        let lastMatch = playerData[playerIndex].data[playerData[playerIndex].data.length - 1] || { y: 0 };
        let prevTotal = lastMatch.y;
  
        let goals = 0;
  
        if (scorerIndex > -1) {
          goals = game.scorers[scorerIndex].goals
        }
  
        playerData[playerIndex].data.push({
          "t": game.date,
          "goals": goals,
          "y": prevTotal + goals
        })
      })
    })
  
    return playerData;
  }
  