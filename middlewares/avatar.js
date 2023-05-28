const database = require("../repositories");
const svc = require("../services");
const path = require("path");

const db = database.getConnection();

function getAvatar(req, res, next){
    const accessToken = req.cookies["accessToken"];

    try {
        const decoded = svc.getData(accessToken);

        db.then(conn => {
            conn.query("SELECT A.FILE_PATH FROM USER U JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID WHERE U.USERNAME = ?", [decoded.username])
            .then(rows => {
              const avatar = rows[0].FILE_PATH
              //console.log(avatar);
              const avatarPath = "/assets/" + avatar;
              req.avatar = avatarPath;
              next();
            })
          });

      } catch (error) {
        console.log(error);
      }

}

module.exports = { getAvatar };

