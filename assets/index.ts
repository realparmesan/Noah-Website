import * as _ from 'lodash';
import { populateGsGraph, populatePointsGraph, populateCleanSheetGraph, getYearFilter, updateAllGraphs } from "./ts/graphs";

window.addEventListener('load', function () {
    populateAllGraphs();

    const selectElement = <HTMLInputElement>document.getElementById("yearSelect");

    selectElement.addEventListener('change', (event) => {
        populateAllGraphs();
    });
})

function populateAllGraphs(){
    let year = getYearFilter();
    updateAllGraphs(year);
}

