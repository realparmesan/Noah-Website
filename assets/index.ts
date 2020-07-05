import * as _ from 'lodash';
import { populateGsGraph, populatePointsGraph, populateCleanSheetGraph, getYearFilter } from "./ts/graphs";

window.addEventListener('load', function () {
    let year = getYearFilter();
    populateGsGraph(year);
    populatePointsGraph();
    populateCleanSheetGraph();
})
