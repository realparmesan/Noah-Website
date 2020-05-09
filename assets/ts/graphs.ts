import * as d3 from 'd3';

let data = [4, 8, 15, 16, 23, 42];

const x = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([0, 420])

/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph = async function () {
  {
    let div = d3.select("#stats-panel")
      .style("font", "10px sans-serif")
      .style("text-align", "right")
      .style("color", "white");

    div.selectAll("div")
      .data(data)
      .join("div")
      .style("background", "steelblue")
      .style("padding", "3px")
      .style("margin", "1px")
      .style("width", d => `${x(d)}px`)
      .text(d => d);

    return div.node();
  }
}
