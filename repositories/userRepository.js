const database = require("./index");

const db = database.getConnection();

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
