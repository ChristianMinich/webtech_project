const database = require('./index');

const db = database.getConnection();

/**
 *
 * @param questionID
 * @returns {Promise<unknown>}
 */
function getQuestions(questionID) {
    return new Promise((resolve, reject) => {
        db.then(conn => {
            conn.query("SELECT * FROM QUESTION WHERE QUESTION_ID = ?", [questionID])
                .then(rows => {
                    resolve(rows);
                })
                .catch(error => {
                    reject(error);
                })
        })
        .catch(error => {
            reject(error);
        })
    });
}


module.exports = { getQuestions };