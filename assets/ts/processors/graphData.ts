import { getGoalsData, getResultsData, getSquadData, getMatchGoalsData } from "../apiQueries";
import * as _ from 'lodash';

export type chartGoalsData = {
    label: string,
    fill: boolean,
    data: matchGoals[]
};

export type matchGoals = {
    t: Date,
    goals: number,
    y: number
};

export type cleanSheets = {
    t: Date,
    y: number
};

export type matchResult = {
    t: Date,
    points: number,
    result: string,
    y: number
};

export let parsePlayerData = async function () {
    let data = await getGoalsData();
    let scorers = _.map(_.flatten(_.map(data, "scorers")), "scorer");
    let squadData = await getSquadData();

    scorers = scorers.concat(squadData.players);
    let scorerNames = _.uniq(scorers);

    let playerData = scorerNames.map(name => {
        let record: chartGoalsData = {
            "label": name,
            "fill": false,
            "data": []
        }
        return record;
    });

    data = data.sort((a, b) => {
        return a.date.getTime() - b.date.getTime()
    })



    data.forEach(game => {
        scorerNames.forEach((scorer) => {
            let playerIndex = playerData.findIndex(e => e.label == scorer)
            let scorerIndex = game.scorers.findIndex(e => e.scorer == scorer)

            let lastMatch = playerData[playerIndex].data[playerData[playerIndex].data.length - 1] || { y: 0 };
            let prevTotal = lastMatch.y;

            let goals = 0;

            if (scorerIndex > -1) {
                goals = game.scorers[scorerIndex].goals
            }

            playerData[playerIndex].data.push({
                "t": game.date,
                "goals": goals,
                "y": prevTotal + goals
            })
        })
    })

    return playerData;
}

export let parsePointsData = async function () {
    let data = await getResultsData();

    data = data.sort((a, b) => {
        return a.date.getTime() - b.date.getTime()
    })

    let resultsData: matchResult[] = [];

    data.forEach(game => {
        let lastMatch = resultsData[resultsData.length - 1] || { y: 0 };
        let prevTotal = lastMatch.y;

        let points = 0;

        if (game.result === "Win") {
            points = 3;
        }
        else if (game.result === "Draw") {
            points = 1;
        }
        else if (game.result === "Loss") {
            points = 0;
        }
        else {
            return;
        }

        resultsData.push({
            "t": game.date,
            "points": points,
            "result": game.result,
            "y": prevTotal + points
        })
    })

    return resultsData;
}

export let parseCleanSheetData = async function () {
    let data = await getMatchGoalsData();

    data = data.sort((a, b) => {
        return a.date.getTime() - b.date.getTime()
    })

    let resultsData: cleanSheets[] = [];

    data.forEach(game => {
        let lastMatch = resultsData[resultsData.length - 1] || { y: 0 };
        let prevTotal = lastMatch.y;

        let cs = 0;

        if (game.opponent_goals > 0) {
            cs = 0;
        }
        else {
            cs = 1;
        }

        resultsData.push({
            "t": game.date,
            "y": prevTotal + cs
        })
    })

    return resultsData;
}
