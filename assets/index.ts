import * as _ from 'lodash';
import { getYearFilter, updateAllGraphs } from "./ts/graphs";
import { getPlayerName, populateStats } from "./ts/stats";

window.addEventListener('load', function () {
    populateAllGraphs();
    populateIndividualStats();

    const selectElement = <HTMLInputElement>document.getElementById("yearSelect");

    if (selectElement === null){
      return null;
    }

    selectElement.addEventListener('change', (event) => {
        populateAllGraphs();
    });
})

function populateAllGraphs(){
    let year = getYearFilter();
    updateAllGraphs(year);
}

function populateIndividualStats(){
  let player = getPlayerName();
  populateStats(player);
}