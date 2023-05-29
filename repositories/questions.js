const database = require('./index');

const db = database.getConnection();

function getQuestions(questionID){
    db.then(conn => {
        conn.query("SELECT * FROM QUESTION WHERE QUESTION_ID = ?", [questionID])
        .then(rows => {
            return rows;
        })
        .catch(error => {
            console.log(error);
        })
    })
    .catch(error => {
        console.log(error);
    })
}


module.exports = { getQuestions };