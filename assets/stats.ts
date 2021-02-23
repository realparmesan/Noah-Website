import { getYearFilter, updateAllGraphs } from "./ts/graphs";

window.addEventListener('load', function () {
  populateAllGraphs();

  const selectElement = <HTMLInputElement>document.getElementById("yearSelect");

  if (selectElement === null) {
    return null;
  }

  selectElement.addEventListener('change', (event) => {
    populateAllGraphs();
  });
})

function populateAllGraphs() {
  let year = getYearFilter();
  updateAllGraphs(year);
}