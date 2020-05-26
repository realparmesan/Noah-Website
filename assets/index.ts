import * as _ from 'lodash';
import { populateGsGraph, populatePointsGraph } from "./ts/graphs";

window.addEventListener('load', function () {
    populateGsGraph();
    populatePointsGraph();
})
