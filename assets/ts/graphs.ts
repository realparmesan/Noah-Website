import * as d3 from 'd3';
import { getGoalsData, gameData, scorerData } from "./apiQueries";
import * as _ from 'lodash';

export type playerScoringRecord = {
  name: string,
  matches: matchGoals[]
};

export type matchGoals = {
  date: Date,
  matchGoals: number,
  totalGoals: number
};

let parsePlayerData = function (data: gameData[]) {
  let temp = _.map(data, "scorers")
  let temp2 = _.flatten(temp);
  let scorerNames = _.sortedUniq(_.map(temp2, "scorer"));

  let playerData = scorerNames.map(name => {
    let record: playerScoringRecord = {
      "name": name,
      "matches": []
    }
    return record;
  });

  data = data.sort((a,b) => {
    return a.date.getTime() - b.date.getTime()
  })

  data.forEach(game => {
    game.scorers.forEach((scorer) => {
      let index = playerData.findIndex(e => e.name == scorer.scorer)

      let lastMatch = playerData[index].matches[playerData[index].matches.length-1] || {totalGoals : 0};
      let prevTotal = lastMatch.totalGoals;

      playerData[index].matches.push({
        "date": game.date,
        "matchGoals": scorer.goals,
        "totalGoals": prevTotal + scorer.goals
      })
    })
  })

  console.log("playerData",playerData)
  return playerData;
}

/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph = async function () {
  let data = await getGoalsData();
  let playerData = parsePlayerData(data);

  var lineData = playerData[1].matches;

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

  y.domain(d3.extent(lineData, function (d) { return d.totalGoals; }));

  var valueline = d3.line()
    .x(function (d: any) { return x(d.date); })
    .y(function (d: any) { return y(d.totalGoals); })
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
    .attr("cy", function (d) { return y(d.totalGoals) })
    .attr("r", 5);

  svg.selectAll(".text")
    .data(lineData)
    .enter()
    .append("text") // Uses the enter().append() method
    .attr("class", "label") // Assign a class for styling
    .attr("x", function (d, i) { return x(d.date) })
    .attr("y", function (d) { return y(d.totalGoals) })
    .attr("dy", "-5")
    .text(function (d) { return d.totalGoals; });

  // svg.append('text')
  //   .attr('x', 10)
  //   .attr('y', -5)
  //   .text('Almaty');

}