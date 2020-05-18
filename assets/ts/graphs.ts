import { Chart, ChartPoint } from 'chart.js';
import 'chartjs-plugin-colorschemes';
import { getGoalsData, gameData, scorerData } from "./apiQueries";
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

let parsePlayerData = function (data: gameData[]) {
  let temp = _.map(data, "scorers")
  let temp2 = _.flatten(temp);
  let scorerNames = _.sortedUniq(_.map(temp2, "scorer"));

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

/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph = async function () {
  let data = await getGoalsData();
  let playerData = parsePlayerData(data);
  console.log("playerData", playerData);

  let temp = <HTMLCanvasElement>document.getElementById("stats-panel");
  let ctx = temp.getContext("2d");

  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: playerData
    },
    options: {
      scales: {
        xAxes: [{
          type: 'time'
        }]
      },
      plugins: {
        colorschemes: {
          scheme: 'brewer.Paired12'
        }
      },
      tooltips: {
        callbacks: {
          title: function (items, data) {
            let title = "";
            items.forEach((item, index) => {
              title += data.datasets[item.datasetIndex].label;
              if (index != (items.length - 1)) {
                title += ", "
              }
            })

            return title
          },
          footer: function (item, data) {
            let dataItem = <matchGoals>data.datasets[item[0].datasetIndex].data[item[0].index];
            let yourDate = dataItem.t;
            yourDate = new Date(yourDate.getTime());
            return yourDate.toISOString().split('T')[0]
          },
          label: function (item, data) {
            let dataItem = <matchGoals>data.datasets[item.datasetIndex].data[item.index];
            return "Total Goals:\t" + dataItem.y + "\nGameday Goals:\t" + dataItem.goals;
          }
        },
      }
    }
  })
}
