const database = require("./index");

const db = database.getConnection();

/**
 * The function gets username from the Database.
 *
 * @param username - The username of the player to get.
 */
function getUserbyName(username) {
  db.then((conn) => {
    conn
      .query("SELECT username FROM USERS WHERE username = ?", [username])
      .then((rows) => {
        return new Promise(rows[0].username);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

/**
 * The function creates a new user in the database with the provided username and encrypted password.
 *
 * @param username - The username of the new user.
 * @param encryptedPassword - The encrypted password of the new user.
 * @returns {Promise<void>} - A Promise that resolves when the user is created successfully.
 */
function createUser(username, encryptedPassword) {
  db.then((conn) => {
    conn.query("INSERT INTO USERS (username, password) VALUES (?, ?)", [
      username,
      encryptedPassword,
    ]);
    conn.end;
  }).catch((error) => {
    console.log(error);
    conn.end;
  });
}

module.exports = { getUserbyName, createUser };
