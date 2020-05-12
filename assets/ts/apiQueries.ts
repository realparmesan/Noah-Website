import { default as axios } from 'axios';
import * as _ from 'lodash';

const postAPI = '/posts/index.json';

/**
 * @summary Goal scorers graphics.
 */
export let getGoalsData = async function () {
    let response = await axios.get(postAPI);
    console.log(response.data);
    let data = response.data.data;

    let goalscorers = data.items.map((a: { date: any; scorers: any; }) => {
        let game = {
            "date": a.date,
            "scorers": a.scorers
        }
        return game
    }
    )

    return response.data;
};