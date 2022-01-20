import sqlite3 from 'sqlite3'

const db =
    new sqlite3.Database('/Users/alexgraham/PycharmProjects/dfkpricebot/heroprofessions', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

export async function get_hero(heroId) {
    return new Promise(async (resolve) => {
        let sql = `SELECT profession
                   from hp
                   where heroId = ?`;
        await db.get(sql, heroId, (err, row) => {
            if (err) {
                console.log(err);
                console.log("error");
            }
            const hero = row
            if (hero !== undefined)
                resolve(hero)
            else
                resolve('out of index');
        });
    });
}

