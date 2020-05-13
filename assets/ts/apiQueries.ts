import { default as axios } from 'axios';
import * as _ from 'lodash';

const postAPI = '/posts/index.json';

/**
 * @summary Goal scorers graphics.
 */
export let getGoalsData = async function () {
    let response = await axios.get(postAPI);
    let data = response.data.data;

    let goalscorers: gameData[] = data.items.map((a: { date: any; scorers: any; }) => {
        if (a.scorers === null) {
            return null;
        }
        
        let game: gameData = {
            "date": a.date,
            "scorers": a.scorers
        }
        return game
    }
    );

    goalscorers = goalscorers.filter((a:any) => a != null);

    return goalscorers;
};

export type gameData = {
    date: Date,
    scorers: scorerData[]
};

export type scorerData = {
    scorer: string,
    goals: number
};
