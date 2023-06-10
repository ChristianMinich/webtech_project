const database = require("../repositories");
const svc = require("../services");
const db = database.getConnection();

/**
 * Middleware function to retrieve the avatar file path for a user.
 *
 * @param req - Express request object.
 * @param res - Express respond object.
 * @param next - Next function for in the middleware chain.
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
