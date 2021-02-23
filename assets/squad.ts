import { getPlayerName, populateStats } from "./ts/stats";

window.addEventListener('load', function () {
  populateIndividualStats();
})

function populateIndividualStats(){
  let player = getPlayerName();
  populateStats(player);
}