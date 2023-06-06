const svc = require("../services");
const database = require("../repositories");
const path = require("path");
const db = database.getConnection();

function renderDashboard(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (accessToken) {
    try {
      const decoded = svc.getData(accessToken);
      const user = decoded.username;

      db.then((conn) => {
        conn
          .query(
            "SELECT A.FILE_PATH FROM USER U JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID WHERE U.USERNAME = ?",
            [user]
          )
          .then((rows) => {
            try {
              const avatar = rows[0].FILE_PATH;
              const avatarPath = "/assets/emojis/" + avatar;
              return res.render("dashboard", {
                username: user,
                avatar: avatarPath,
              });
            } catch (error) {
              console.log(error);
            }
          })
          .catch((error) => {
            console.log(error);
            next();
          });
      }).catch((error) => {
        console.log(error);
        next();
      });
    } catch (err) {
      console.log(err);
      next();
    }
  } else {
    next();
  }
}

function authenticateToken(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken) {
    console.log("redirected!");
    return res.redirect("/login");
  }

  try {
    const decoded = svc.getData(accessToken);
    console.log(decoded);
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

module.exports = { authenticateToken, renderDashboard };
