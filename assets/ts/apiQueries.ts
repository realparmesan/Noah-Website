import { default as axios } from 'axios';
import * as _ from 'lodash';

const postsAPI = '/posts/index.json';
const squadAPI = '/squad/frothers/index.json';

/**
 * @summary Goal scorers graphics.
 */
export let getGoalsData = async function () {
    let response = await axios.get(postsAPI);
    let data = response.data.data;

    let goalscorers: gameData[] = data.items.map((a: { date: any; scorers: any; }) => {
        if (a.scorers === null) {
            return null;
        }
        
        let game: gameData = {
            "date": new Date(a.date),
            "scorers": a.scorers
        }
        return game
    }
    );

    goalscorers = goalscorers.filter((a:any) => a != null);

    return goalscorers;
};

/**
 * @summary Goal scorers graphics.
 */
export let getSquadData = async function () {
    let response = await axios.get(squadAPI);
    let data = response.data.data;
    let squad: squadData = data
   
    return squad;
};

export type squadData = {
    players: string[]
};

export type gameData = {
    date: Date,
    scorers: scorerData[]
};

export type scorerData = {
    scorer: string,
    goals: number
};
