const database = require("./index");
const db = database.getConnection();

/**
 * Retrieves a user from the database based on their username.
 *
 * @param {string} username - The username of the player to retrieve.
 * @returns {Promise<string>} - A Promise that resolves with the username of the user if found, or rejects with an error if not found.
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
