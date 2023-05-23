const database = require('../../repositories/index');

const db = database.getConnection();

function getScoreboard() {
    db.then(conn => {
    conn.query('SELECT USERNAME, HIGHSCORE FROM USER ORDER BY HIGHSCORE LIMIT 10')
        .then(rows => {
            return rows;
        })
        .catch(error => {
            console.log(error);
            conn.end;
        })
    })
    .catch(error => {
    console.log(error);
    conn.end;
});
}

module.exports = {getScoreboard};