import * as _ from 'lodash';
import { populateGsGraph, populatePointsGraph, populateCleanSheetGraph } from "./ts/graphs";

window.addEventListener('load', function () {
    populateGsGraph();
    populatePointsGraph();
    populateCleanSheetGraph();
})
