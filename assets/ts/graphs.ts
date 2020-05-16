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


// var margin = { top: 50, right: 50, bottom: 50, left: 50 }
//   , width = window.innerWidth - margin.left - margin.right // Use the window's width 
//   , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

// const chartHeight = height - margin.top - margin.bottom;
// const chartWidth = width - margin.left - margin.right;

const xScale = d3.scaleTime()
  .domain([new Date(2020, 0, 1), new Date(2020, 12, 1)])

const yScale = d3.scaleLinear()
  .domain([0, 30])

let xAxisGenerator = d3.axisBottom(xScale)
  .tickValues(d3.range(1, 12).map(d => new Date(2020, d, 1)));

let yAxisGenerator = d3.axisLeft(yScale)
  .tickValues(d3.range(0, 30, 0));

let last = (array: any[]) => array[array.length - 1];

let lineGenerator = d3.line<weekData>()
  .x((d) => xScale(d.week))
  .y((d) => yScale(d.count));

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
  let data = await getGoalsData();
  let playerData = parsePlayerData(data);

  console.log(playerData);

  let div = d3.select("#stats-panel")
  const g = div.append("g")
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("g")
    .call(xAxisGenerator)
    // .attr("transform", `translate(0, ${chartHeight})`);

  g.append("g")
    .call(yAxisGenerator);

  g.selectAll(".line")
    .data(playerData)
    .enter().append("path")
    .attr("d", d => lineGenerator(d.data))
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("stroke-linejoin", "round");

  const valueLabel = g.selectAll(".label")
    .data(playerData)
    .enter().append("g")
    .attr("transform", d => `translate(${xScale(last(d.data).week)}, ${yScale(last(d.data).count)})`);

  valueLabel.append("circle")
    .attr("r", 4)
    .style("stroke", "white")

  valueLabel.append("text")
    .text(d => last(d.data).count)
    .attr("dy", 5)
    .attr("dx", 10)
    .style("font-family", "monospace")

  return div.node()
}
/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph2 = async function () {

  var optwidth = 600;
  var optheight = 370;

  let data = await getGoalsData();
  let dataset = parsePlayerData(data);

  /*
  * ========================================================================
  *  sizing
  * ========================================================================
  */

  /* === Focus chart === */

  var margin = { top: 20, right: 30, bottom: 100, left: 20 },
    width = optwidth - margin.left - margin.right,
    height = optheight - margin.top - margin.bottom;

  /* === Context chart === */

  var margin_context = { top: 320, right: 30, bottom: 20, left: 20 },
    height_context = optheight - margin_context.top - margin_context.bottom;

  /*
  * ========================================================================
  *  x and y coordinates
  * ========================================================================
  */

  // the date range of available data:
  var dataXrange = d3.extent(dataset[0].data, function (d) { return d.week; });
  var dataYrange = [0, d3.max(dataset, player => {
      return d3.max(player.data, d => d.count)
    }
  )
  ];

  // maximum date range allowed to display
  var mindate = dataXrange[0],  // use the range of the data
    maxdate = dataXrange[1];

  var DateFormat = d3.timeFormat("%b %Y");

  // var dynamicDateFormat = timeFormat([
  // [d3.timeFormat("%Y"), function() { return true; }],// <-- how to display when Jan 1 YYYY
  // [d3.timeFormat("%b %Y"), function(d) { return d.getMonth(); }],
  // [function(){return "";}, function(d) { return d.getDate() != 1; }]
  // ]);

  /* === Focus Chart === */

  let svg = d3.select("#stats-panel")

  var x = d3.scaleTime()
    .range([0, (width)])
    .domain(dataXrange);

  var y = d3.scaleLinear()
    .range([height, 0])
    .domain(dataYrange);

  var xAxis = d3.axisBottom(x)
    .tickSize(-(height))
    // .ticks(customTickFunction)

  var yAxis = d3.axisRight(y)
    .ticks(4)
    .tickSize(-(width))

  /* === Context Chart === */

  var x2 = d3.scaleTime()
    .range([0, width])
    .domain([mindate, maxdate]);

  var y2 = d3.scaleLinear()
    .range([height_context, 0])
    .domain(y.domain());

  // var xAxis_context = d3.svg.axis()
  //   .scale(x2)
  //   .orient("bottom")
  //   .ticks(customTickFunction)
  //   .tickFormat(dynamicDateFormat);

  /*
  * ========================================================================
  *  Functions
  * ========================================================================
  */

  // === tick/date formatting functions ===
  // from: https://stackoverflow.com/questions/20010864/d3-axis-labels-become-too-fine-grained-when-zoomed-in

  // function timeFormat(formats) {
  //   return function(date) {
  //     var i = formats.length - 1, f = formats[i];
  //     while (!f[1](date)) f = formats[--i];
  //     return f[0](date);
  //   };
  // };

  // function customTickFunction(t0, t1, dt) {
  //   var labelSize = 42; //
  //   var maxTotalLabels = Math.floor(width / labelSize);

  //   function step(date, offset) {
  //     date.setMonth(date.getMonth() + offset);
  //   }

  //   var time = d3.time.month.ceil(t0), times = [], monthFactors = [1, 3, 4, 12];

  //   while (time < t1) times.push(new Date(+time)), step(time, 1);
  //   var timesCopy = times;
  //   var i;
  //   for (i = 0; times.length > maxTotalLabels; i++)
  //     times = _.filter(timesCopy, function (d) {
  //       return (d.getMonth()) % monthFactors[i] == 0;
  //     });

  //   return times;
  // };

  // === tooltip functions === //

  // from: http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
  // function show_tooltip(d) {

  //   if (d.new_count == 1) {
  //     var metricName_point = d.name.slice(0, -1);
  //   } else {
  //     var metricName_point = d.name;
  //   }

  //   div.transition()
  //     .duration(60)
  //     .style("opacity", 0.98);
  //   div.html(d.new_count + " " + metricName_point + " in <b>" + DateFormat(d.month) + "</b><br/>" + d.count + " " + metricName + " total")
  //     .style("left", (d3.event.pageX - 45) + "px")
  //     .style("top", (d3.event.pageY - 50) + "px");
  // };

  // function hide_tooltip(d) {
  //   div.transition()
  //     .duration(60)
  //     .style("opacity", 0);
  // };


  // === brush and zoom functions ===

  // function brushed() {
  //   x.domain(brush.empty() ? x2.domain() : brush.extent());
  //   common_behaviour();
  //   // Reset zoom scale's domain
  //   zoom.x(x);
  //   updateDisplayDates();
  //   setYdomain();

  // }

  // function draw() {
  //   setYdomain();
  //   common_behaviour();
  //   // Force changing brush range
  //   brush.extent(x.domain());
  //   vis.select(".brush").call(brush);
  //   // and update the text showing range of dates.
  //   updateDisplayDates();
  // }

  // function common_behaviour() {
  //   focus.select(".area").attr("d", area);
  //   focus.select(".line").attr("d", line);
  //   focus.select(".area_missing").attr("d", area_missing);
  //   focus.select(".line_missing").attr("d", line_missing);
  //   focus.select(".x.axis").call(xAxis);
  //   focus.selectAll(".dot")
  //     .attr("cx", function (d) { return x(d.month); })
  //     .attr("cy", function (d) { return y(d.count); });
  // };

  // function brushend() {
  //   // when brush stops moving:

  //   // check whether chart was scrolled out of bounds and fix,
  //   var b = brush.extent();
  //   var out_of_bounds = brush.extent().some(function (e) { return e < mindate | e > maxdate; });
  //   if (out_of_bounds) { b = moveInBounds(b) };

  // };

  // function updateDisplayDates() {

  //   var b = brush.extent();
  //   // update the text that shows the range of displayed dates
  //   var localBrushDateStart = (brush.empty()) ? DateFormat(dataXrange[0]) : DateFormat(b[0]),
  //     localBrushDateEnd = (brush.empty()) ? DateFormat(dataXrange[1]) : DateFormat(b[1]);

  //   // Update start and end dates in upper right-hand corner
  //   d3.select("#displayDates")
  //     .text(localBrushDateStart == localBrushDateEnd ? localBrushDateStart : localBrushDateStart + " - " + localBrushDateEnd);
  // };

  // function moveInBounds(b) {
  //   // move back to boundaries if user pans outside min and max date.

  //   var ms_in_year = 31536000000,
  //     brush_start_new,
  //     brush_end_new;

  //   if (b[0] < mindate) { brush_start_new = mindate; }
  //   else if (b[0] > maxdate) { brush_start_new = new Date(maxdate.getTime() - ms_in_year); }
  //   else { brush_start_new = b[0]; };

  //   if (b[1] > maxdate) { brush_end_new = maxdate; }
  //   else if (b[1] < mindate) { brush_end_new = new Date(mindate.getTime() + ms_in_year); }
  //   else { brush_end_new = b[1]; };

  //   brush.extent([brush_start_new, brush_end_new]);

  //   brush(d3.select(".brush").transition());
  //   brushed();
  //   draw();

  //   return (brush.extent())
  // };

  // function setYdomain() {
  //   // this function dynamically changes the y-axis to fit the data in focus

  //   // get the min and max date in focus
  //   var xleft = new Date(x.domain()[0]);
  //   var xright = new Date(x.domain()[1]);

  //   // a function that finds the nearest point to the right of a point
  //   var bisectDate = d3.bisector(function (d) { return d.month; }).right;

  //   // get the y value of the line at the left edge of view port:
  //   var iL = bisectDate(dataset, xleft);

  //   if (dataset[iL] !== undefined && dataset[iL - 1] !== undefined) {

  //     var left_dateBefore = dataset[iL - 1].month,
  //       left_dateAfter = dataset[iL].month;

  //     var intfun = d3.interpolateNumber(dataset[iL - 1].count, dataset[iL].count);
  //     var yleft = intfun((xleft - left_dateBefore) / (left_dateAfter - left_dateBefore));
  //   } else {
  //     var yleft = 0;
  //   }

  //   // get the x value of the line at the right edge of view port:
  //   var iR = bisectDate(dataset, xright);

  //   if (dataset[iR] !== undefined && dataset[iR - 1] !== undefined) {

  //     var right_dateBefore = dataset[iR - 1].month,
  //       right_dateAfter = dataset[iR].month;

  //     var intfun = d3.interpolateNumber(dataset[iR - 1].count, dataset[iR].count);
  //     var yright = intfun((xright - right_dateBefore) / (right_dateAfter - right_dateBefore));
  //   } else {
  //     var yright = 0;
  //   }

  //   // get the y values of all the actual data points that are in view
  //   var dataSubset = dataset.filter(function (d) { return d.month >= xleft && d.month <= xright; });
  //   var countSubset = [];
  //   dataSubset.map(function (d) { countSubset.push(d.count); });

  //   // add the edge values of the line to the array of counts in view, get the max y;
  //   countSubset.push(yleft);
  //   countSubset.push(yright);
  //   var ymax_new = d3.max(countSubset);

  //   if (ymax_new == 0) {
  //     ymax_new = dataYrange[1];
  //   }

  //   // reset and redraw the yaxis
  //   y.domain([0, ymax_new * 1.05]);
  //   focus.select(".y.axis").call(yAxis);

  // };

  // function scaleDate(d, i) {
  //   // action for buttons that scale focus to certain time interval

  //   var b = brush.extent(),
  //     interval_ms,
  //     brush_end_new,
  //     brush_start_new;

  //   if (d == "year") { interval_ms = 31536000000 }
  //   else if (d == "month") { interval_ms = 2592000000 };

  //   if (d == "year" | d == "month") {

  //     if ((maxdate.getTime() - b[1].getTime()) < interval_ms) {
  //       // if brush is too far to the right that increasing the right-hand brush boundary would make the chart go out of bounds....
  //       brush_start_new = new Date(maxdate.getTime() - interval_ms); // ...then decrease the left-hand brush boundary...
  //       brush_end_new = maxdate; //...and set the right-hand brush boundary to the maxiumum limit.
  //     } else {
  //       // otherwise, increase the right-hand brush boundary.
  //       brush_start_new = b[0];
  //       brush_end_new = new Date(b[0].getTime() + interval_ms);
  //     };

  //   } else if (d == "data") {
  //     brush_start_new = dataXrange[0];
  //     brush_end_new = dataXrange[1]
  //   } else {
  //     brush_start_new = b[0];
  //     brush_end_new = b[1];
  //   };

  //   brush.extent([brush_start_new, brush_end_new]);

  //   // now draw the brush to match our extent
  //   brush(d3.select(".brush").transition());
  //   // now fire the brushstart, brushmove, and brushend events
  //   brush.event(d3.select(".brush").transition());
  // };

}