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
  console.log("player");
  let player = getPlayerName();
  console.log(player);
  populateStats(player);
}