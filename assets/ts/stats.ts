import * as _ from 'lodash';

import { parsePlayerData, parsePointsData, parseCleanSheetData, matchGoals, matchResult, chartGoalsData } from './processors/graphData'

/**
 * @summary Get the filter value
 */
export let getPlayerName = function (): string {
  let input = <HTMLElement>document.getElementById("individual-stats-panel");
  return input.getAttribute("data-player-name");
}

/**
 * @summary populate player stats
 */
export let populateStats = async function (name: string) {
  let allPlayerData = await parsePlayerData();

  let onePlayerData = allPlayerData.filter(gameData => {
    if (gameData.label === name) {
      return true;
    }
    else {
      return false;
    }
  });

  let playerData = onePlayerData[0];
  
  let totalGoals = 0;
  playerData.data.forEach(game => {
    totalGoals = game.goals + totalGoals;
  });

  let goalsElement = <HTMLElement>document.getElementById("total-goals");

  goalsElement.innerText = totalGoals.toString();
}
