import * as _ from 'lodash';
import { Chart } from 'chart.js';

import { parsePlayerData, matchGoals, chartGoalsData } from './processors/graphData'

let screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
let careerChart: Chart;

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

  // Set Goals string
  goalsElement.innerText = totalGoals.toString();

  // Populate graph
  let chartData = <HTMLElement>document.getElementById("individual-stats-panel");
  let appearances: matchGoals[] = JSON.parse(chartData.getAttribute("data-appearances")) || [];

  appearances.forEach(set => {
    set.t = new Date(set.t.toString());
  })

  let appearanceLine: chartGoalsData = {
    label: "Appearances",
    fill: false,
    data: appearances
  }

  let goalsLine: chartGoalsData = {
    label: "Goals",
    fill: false,
    data: []
  }

  let playerYearGoals = playerData.data;

  playerYearGoals.forEach(goals => {
    goals.t = new Date(goals.t.getFullYear().toString());
  })

  let output: matchGoals[] =
    _(playerYearGoals)
      .groupBy('t')
      .map((objs, key) => {
        let goal = {
        "t" : new Date(key),
        "y" : _.sumBy(objs, 'goals'),
        "goals": 0
        }

        return goal;
      })
      .value();

  goalsLine.data = output;

  let careerPanel = <HTMLCanvasElement>document.getElementById("career-panel");

  if (careerPanel == null) {
    return;
  }

  let ctx = careerPanel.getContext("2d");

  if (careerChart) {
    careerChart.destroy();
  }

  careerChart = new Chart(ctx, {
    "type": 'line',
    "data": {
      "datasets": [appearanceLine, goalsLine]
    },
    "options": {
      elements: {
        line: {
          tension: 0, // disables bezier curves
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 50,
          right: 50,
          top: 0,
          bottom: 0
        }
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'year'
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            suggestedMax: 15,
          }
        }]
      },
    }
  })
}
