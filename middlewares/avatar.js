const database = require("../repositories");
const svc = require("../services");
const path = require("path");

const db = database.getConnection();

/**
 *
 * @param req
 * @param res
 * @param next
 */
function getAvatar(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  try {
    const decoded = svc.getData(accessToken);

    db.then((conn) => {
      conn
        .query(
          "SELECT A.FILE_PATH FROM USER U JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID WHERE U.USERNAME = ?",
          [decoded.username]
        )
        .then((rows) => {
          try {
            const avatar = rows[0].FILE_PATH;
            const avatarPath = "/assets/emojis/" + avatar;
            req.avatar = avatarPath;
            next();
          } catch (error) {
            console.log(error);
          }
        });
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getAvatar };
