import * as d3 from 'd3';
import { getGoalsData, gameData, scorerData } from "./apiQueries";
import * as _ from 'lodash';

export type playerScoringRecord = {
  name: string,
  matches: matchGoals[]
};

export type matchGoals = {
  date: Date,
  goals: number
};

export type weekDataSet = {
  name: string,
  data: weekData[]
}

export type weekData = {
  count: number, week: Date, data_point: Boolean, new_count: number
}

let parsePlayerData = function (data: gameData[]) {
  let temp = _.map(data, "scorers")
  let temp2 = _.flatten(temp);
  let scorerNames = _.sortedUniq(_.map(temp2, "scorer"));

  let dates = data.map(d => d.date);
  var gameWeeks: string[] = [];

  let playerData = scorerNames.map(name => {
    let record: playerScoringRecord = {
      "name": name,
      "matches": []
    }
    return record;
  });

  data.forEach(game => {
    game.scorers.forEach((scorer) => {
      let index = playerData.findIndex(e => e.name == scorer.scorer)

      playerData[index].matches.push({
        "date": game.date,
        "goals": scorer.goals
      })
    })
  })


  // change dates to milliseconds
  dates.forEach(function (part) {
    let func = d3.timeFormat("%Y-%W");
    gameWeeks.push(func(part));
  });

  // get a list of all months in the range of data
  var weekArray = d3.scaleTime()
    .domain(d3.extent(dates))
    .nice().ticks(d3.utcWeek.every(1));

  // check if there is data for each month in monthArray, if so append count, otherwise append null
  let dataset: weekDataSet[] = [];
  let running_total = 0;

  playerData.forEach(player => {
    running_total = 0;
    let goalsDates = player.matches.map(d => d3.timeFormat("%Y-%W")(d.date));
    let data: weekData[] = [];

    weekArray.forEach(week => {
      var n = goalsDates.indexOf(d3.timeFormat("%Y-%W")(week));
      if (n > -1) {
        running_total = running_total + player.matches[n].goals;
        var data_point = true;
        var new_count = player.matches[n].goals;
      } else {
        running_total = running_total;
        var data_point = false;
      }
      data.push({ count: running_total, week: week, data_point: data_point, new_count: new_count });
    })

    dataset.push({
      name: player.name,
      data: data
    })
  });

  console.log("dataset", dataset);

  return dataset
}

/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph = async function () {
  // let data = await getGoalsData();
  // let playerData = parsePlayerData(data);

  var lineData = [];

  lineData.push({ date: new Date(2019, 1, 4),  nps: 89 });
  lineData.push({ date: new Date(2019, 1, 11), nps: 96 });
  lineData.push({ date: new Date(2019, 1, 18), nps: 87 });
  lineData.push({ date: new Date(2019, 1, 25), nps: 99 });
  lineData.push({ date: new Date(2019, 2, 4),  nps: 83 });
  lineData.push({ date: new Date(2019, 2, 11), nps: 93 });
  lineData.push({ date: new Date(2019, 2, 18), nps: 79 });
  lineData.push({ date: new Date(2019, 2, 25), nps: 94 });
  lineData.push({ date: new Date(2019, 3, 4),  nps: 89 });
  lineData.push({ date: new Date(2019, 3, 11), nps: 93 });
  lineData.push({ date: new Date(2019, 3, 18), nps: 81 });

  lineData.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  var height = 200;
  var width = 700;

  var margin = { top: 20, right: 15, bottom: 25, left: 25 };

  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var svg = d3.select('#stats-panel')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the ranges
  var x = d3.scaleTime().range([0, width]);

  x.domain(d3.extent(lineData, function (d) { return d.date; }));

  var y = d3.scaleLinear().range([height, 0]);

  y.domain([d3.min(lineData, function (d) { return d.nps; }) - 5, 100]);

  var valueline = d3.line()
    .x(function (d: any) { return x(d.date); })
    .y(function (d: any) { return y(d.nps); })
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .data([lineData])
    .attr("class", "line")
    .attr("d", <any>valueline);

  //  var xAxis_woy = d3.axisBottom(x).tickFormat(d3.timeFormat("Week %V"));
  var xAxis_woy = d3.axisBottom(x).ticks(11).tickFormat(d3.timeFormat("%y-%b-%d")).tickValues(lineData.map(d => d.date));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis_woy);

  //  Add the Y Axis
  //  svg.append("g").call(d3.axisLeft(y));

  svg.selectAll(".dot")
    .data(lineData)
    .enter()
    .append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function (d) { return x(d.date) })
    .attr("cy", function (d) { return y(d.nps) })
    .attr("r", 5);

  svg.selectAll(".text")
    .data(lineData)
    .enter()
    .append("text") // Uses the enter().append() method
    .attr("class", "label") // Assign a class for styling
    .attr("x", function (d, i) { return x(d.date) })
    .attr("y", function (d) { return y(d.nps) })
    .attr("dy", "-5")
    .text(function (d) { return d.nps; });

  svg.append('text')
    .attr('x', 10)
    .attr('y', -5)
    .text('Almaty');

}