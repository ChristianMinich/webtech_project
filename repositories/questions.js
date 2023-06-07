const database = require('./index');

const db = database.getConnection();

/**
 * This function retrieves a question from the database based on its ID.
 *
 * @param questionID - The ID of the question to retrieve.
 * @returns {Promise<unknown>} - A Promise resolving to an array of question rows.
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