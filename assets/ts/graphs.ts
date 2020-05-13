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

const width = 950;
const height = width * .5;
const margin = ({
  left: 20,
  bottom: 20,
  right: 60,
  top: 10
});

const chartHeight = height - margin.top - margin.bottom;
const chartWidth = width - margin.left - margin.right;

const xScale = d3.scaleTime()
  .domain([new Date(2010, 0, 1), new Date(2010, 3, 1)])
  .range([0, chartWidth]);

const yScale = d3.scaleLinear()
  .domain([0, 20])
  .range([chartHeight, 0]);

let xAxisGenerator = d3.axisBottom(xScale)
  .tickValues(d3.range(0, 4).map(d => new Date(2010, d, 1)));

let yAxisGenerator = d3.axisLeft(yScale)
  .tickValues(d3.range(0, 30, 5));

let last = (array: any[]) => array[array.length - 1];

let lineGenerator = d3.line()
  .x((d: any) => xScale(d.date))
  .y((d: any) => yScale(d.value));

let parsePlayerData = function (data: gameData[]) {
  let temp = _.map(data, "scorers")
  let temp2 = _.flatten(temp);

  let scorerNames = _.map(temp2, "scorer")
  console.log(scorerNames);
  let output = scorerNames.map(name => {
    let record: playerScoringRecord = {
      "name": name,
      "matches": []
    }
    return record;
  });

  data.forEach(game => {
    game.scorers.forEach((scorer) => {
      let index = output.findIndex(e => e.name = scorer.scorer)

      output[index].matches.push({
        "date": game.date,
        "goals": scorer.goals
      })
    })
  })
  console.log(output);
  
  return output;
}

/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph = async function () {
  let data = await getGoalsData();
  let playerData = parsePlayerData(data);

  console.log(playerData);

  let div = d3.select("#stats-panel")
  const g = div.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("g")
    .call(xAxisGenerator)
    .attr("transform", `translate(0, ${chartHeight})`);

  g.append("g")
    .call(yAxisGenerator);

  // g.selectAll(".line")
  //   .data(playerData)
  //   .enter().append("path")
  //   .attr("d", d => lineGenerator(d.data))
  //   .style("fill", "none")
  //   .style("stroke-width", 2)
  //   .style("stroke-linejoin", "round");

  // const valueLabel = g.selectAll(".label")
  //   .data(playerData)
  //   .enter().append("g")
  //   .attr("transform", d => `translate(${xScale(last(d.data).date)}, ${yScale(last(d.data).value)})`);

  // valueLabel.append("circle")
  //   .attr("r", 4)
  //   .style("stroke", "white")

  // valueLabel.append("text")
  //   .text(d => last(d.data).value)
  //   .attr("dy", 5)
  //   .attr("dx", 10)
  //   .style("font-family", "monospace")

  return div.node()
}