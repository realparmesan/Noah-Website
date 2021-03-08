import * as _ from 'lodash';
import { Chart, ChartDataSets, ChartPoint } from 'chart.js';

import { parsePlayerData } from './processors/graphData'

let careerChart: Chart;

/**
 * @summary Get the filter value
 */
export let getPlayerName = function (): string {
  let input = <HTMLElement>document.getElementById("individual-stats-panel");
  if (input == null) {
    return;
  }
  return input.getAttribute("data-player-name");
}

/**
 * @summary populate player stats
 */
export let populateStats = async function (name: string) {
  let totalGoals = 0;
  let allPlayerData = await parsePlayerData() || [];

  let playerData = _.find(allPlayerData, { "label": name });

  if (playerData === undefined){ 
    return;
  }

  playerData.data.forEach(game => {
    totalGoals = game.goals + totalGoals;
  });

  let goalsElement = <HTMLElement>document.getElementById("total-goals");

  // Set Goals string
  goalsElement.innerText = totalGoals.toString();

  // Populate graph
  let chartData = <HTMLElement>document.getElementById("individual-stats-panel");
  let appearances: ChartPoint[] = JSON.parse(chartData.getAttribute("data-appearances")).map((apps: { year: any; appearances: any; }) => {
    let app: ChartPoint = {
      x: apps.year,
      y: apps.appearances
    }
    return app;
  });

  let appearanceLine: ChartDataSets = {
    label: "Appearances",
    fill: false,
    showLine: true,
    borderColor: "#3e95cd",
    data: appearances
  }

  let goalsLine: ChartDataSets = {
    label: "Goals",
    borderColor: "#8e5ea2",
    fill: false,
    showLine: true,
  }

  let playerYearGoals: ChartPoint[] = playerData.data.map(goals => {
    let point: ChartPoint = {
      x: goals.t.getFullYear(),
      y: goals.goals
    }
    return point;
  })

  goalsLine.data =
    _(playerYearGoals)
      .groupBy('x')
      .map((objs, key) => {
        let goal = {
          "x": parseInt(key),
          "y": _.sumBy(objs, 'y'),
        }

        return goal;
      })
      .value();

  let careerPanel = <HTMLCanvasElement>document.getElementById("career-panel");

  if (careerPanel == null) {
    return;
  }

  let ctx = careerPanel.getContext("2d");

  if (careerChart) {
    careerChart.destroy();
  }

  careerChart = new Chart(ctx, {
    "type": 'scatter',
    "data": {
      "datasets": [appearanceLine, goalsLine],
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
          ticks: {
            suggestedMin: 2017,
            suggestedMax: 2021,
            stepSize: 1
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero:true,
            suggestedMin: 0,
            suggestedMax: 15,
          }
        }]
      },
    }
  })
}
