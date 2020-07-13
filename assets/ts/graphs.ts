import { Chart, ChartPoint } from 'chart.js';
import 'chartjs-plugin-colorschemes';
import * as _ from 'lodash';

import { parsePlayerData, parsePointsData, parseCleanSheetData, matchGoals, matchResult, chartGoalsData } from './processors/graphData'

/**
 * @summary Get the filter value
 */
export let getYearFilter = function (): number {
    let input = <HTMLInputElement>document.getElementById("yearSelect")
    return parseInt(input.value);
}

/**
 * @summary Goal scorers graphics.
 */
export let populateGsGraph = async function (year: number) {
    let playerData = await parsePlayerData(year);

    let temp = <HTMLCanvasElement>document.getElementById("stats-panel");

    if (temp == null) {
        return;
    }
    temp.innerHTML = "";

    let ctx = temp.getContext("2d");

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: playerData
        },
        options: {
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
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'week'
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 15,
                    }
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
                        let yourDate = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(dataItem.t);
                        return yourDate
                    },
                    label: function (item, data) {
                        let dataItem = <matchGoals>data.datasets[item.datasetIndex].data[item.index];
                        return "Goals:\t" + dataItem.goals;
                    },
                    afterLabel: function (item, data) {
                        let dataItem = <matchGoals>data.datasets[item.datasetIndex].data[item.index];
                        return "(Total:\t" + dataItem.y + ")";
                    },
                },
            }
        }
    })
}

/**
 * @summary Points graphics.
 */
export let populatePointsGraph = async function (year: number) {
    let pointsData = await parsePointsData(year);

    let temp = <HTMLCanvasElement>document.getElementById("results-panel");

    if (temp == null) {
        return;
    }
    temp.innerHTML = "";

    let ctx = temp.getContext("2d");

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                data: pointsData,
                label: "Results",
                fill: false,
                steppedLine: true
            }]
        },
        options: {
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
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'week'
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 15,
                    }
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
                        let dataItem = <matchResult>data.datasets[item[0].datasetIndex].data[item[0].index];
                        let yourDate = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(dataItem.t);
                        return yourDate
                    },
                    label: function (item, data) {
                        let dataItem = <matchResult>data.datasets[item.datasetIndex].data[item.index];
                        return dataItem.result;
                    },
                    afterLabel: function (item, data) {
                        let dataItem = <matchResult>data.datasets[item.datasetIndex].data[item.index];
                        return "(Points:\t" + dataItem.y + ")";
                    },
                },
            }
        }
    })
}

/**
 * @summary Points graphics.
 */
export let populateCleanSheetGraph = async function (year: number) {
    let data = await parseCleanSheetData(year);
    
    let temp = <HTMLCanvasElement>document.getElementById("cleansheet-panel");

    if (temp == null) {
        return;
    }
    temp.innerHTML = "";

    let ctx = temp.getContext("2d");

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                data: data,
                label: "Clean Sheets",
                fill: false,
                steppedLine: true
            }]
        },
        options: {
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
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'week'
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 5,
                    }
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
                        let dataItem = <matchResult>data.datasets[item[0].datasetIndex].data[item[0].index];
                        let yourDate = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(dataItem.t);
                        return yourDate
                    },
                    label: function (item, data) {
                        let dataItem = <matchResult>data.datasets[item.datasetIndex].data[item.index];
                        return dataItem.result;
                    },
                    afterLabel: function (item, data) {
                        let dataItem = <matchResult>data.datasets[item.datasetIndex].data[item.index];
                        return "(Clean Sheet?:\t" + (dataItem.y > 0) + ")";
                    },
                },
            }
        }
    })
}

/**
 * @summary Update all graphs
 */
export let updateAllGraphs = async function (year: number) {
    populateGsGraph(year);
    populatePointsGraph(year);
    populateCleanSheetGraph(year);
}