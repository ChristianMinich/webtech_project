require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const svc = require("../services");
const database = require("../repositories/index");
const db = database.getConnection();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mw = require("../middlewares");
const pw = require("../services/passwordValidator");
const { error } = require("console");

/**
 * GET route handler for accessing the homepage.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/", mw.dashboard, (req, res) => {
  res.status(200).sendFile(path.resolve("public/index.html"));
});

/**
 * GET route handler for accessing the "/index" endpoint.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/index", (req, res) => {
  res.status(200).redirect("/");
});

/**
 * GET route handler for accessing the login page.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/login", mw.dashboard, (req, res) => {
  res.status(200).sendFile(path.resolve("public/login.html"));
});

/**
 * GET route handler for logging out the user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/logout", (req, res) => {
  res.clearCookie("accessToken");
  //res.status(200).redirect("/login");
  res.status(200).redirect("/");
});

/**
 * GET route handler for the imprint.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/impressum", (req, res) => {
  res.status(200).sendFile(path.resolve("public/impressum.html"));
});

/**
 * GET route handler for accessing the registration page.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/register", mw.dashboard, (req, res) => {
  res.status(200).sendFile(path.resolve("public/register.html"));
});

/**
 * GET route handler for accessing the game page.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/game", mw.authToken, (req, res) => {
  res.sendFile(path.resolve("public/game.html"));
});

/**
 * GET route handler for joining the game queue.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/joinQueue", mw.authToken, (req, res) => { //avatar
  const username = req.username;
  const avatar = req.avatar;
  res.render("queue", { username: username, avatar: avatar });
});

/**
 * GET route handler for accessing a game room.
 * It requires authentication token and avatar middleware functions to be executed before
 * handling the request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *@returns {void}
 */
router.get("/game/:roomID", mw.authToken, (req, res) => { //avatar
  const roomID = req.params.roomID;
  const username = req.username;
  const avatar = req.avatar;

  db.then((conn) => {
    conn
      .query("SELECT ROOM_ID FROM ACTIVE_GAME WHERE ROOM_ID = ?", [roomID])
      .then((rows) => {
        try {
          console.log(rows);
          if (rows.length === 0) {
            res.status(401).redirect("/");
          } else {
            res.render("game", {
              roomID: roomID,
              username: username,
              avatar: avatar,
            });
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

//SELECT DISTINCT USERNAME, HIGHSCORE FROM USER WHERE USERNAME = ?

/**
 * GET route handler for accessing a user profile.
 * It requires authentication token and avatar middleware functions to be executed before
 * handling the request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/profile/:username", mw.authToken, (req, res) => { // avatar
  const username = req.params.username;
  const user = req.username;
  const avatar = req.avatar;
  console.log("avatarProfile " + avatar);

  const sqlQuery = `
  SELECT DISTINCT U.USER_ID, U.USERNAME, U.HIGHSCORE, U.WINS, U.CONCURRENT_WINS, U.PERFECT_WINS, U.LOSES, A.FILE_PATH
  FROM USER U
  INNER JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID
  WHERE U.USERNAME = '${username}';
  `;
  db.then((conn) => {
    conn.query(sqlQuery).then((rows) => {
      try {
        const profile_avatar = rows[0].FILE_PATH;
        const achievement_query = `
          SELECT
          a.FILE_NAME
          FROM
          USER_ACHIEVEMENT ua
          JOIN ACHIEVEMENT a ON ua.ACHIEVEMENT_ID = a.ACHIEVEMENT_ID
          WHERE
          ua.USER_ID = '${rows[0].USER_ID}';

          `;
        conn
          .query(achievement_query)
          .then((achievements) => {
            console.log(achievements);
            res.render("profile", {
              achievement: achievements,
              rows: rows,
              username: user,
              profile_avatar: profile_avatar,
              avatar: avatar,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    });
  });
});

/**
 * GET route handler for accessing a all achievments.
 * It requires authentication token and avatar middleware functions to be executed before
 * handling the request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/achievements", mw.authToken, (req, res) => { //avatar
  const user = req.username;
  const avatar = req.avatar;

  const sqlQuery = `
  SELECT FILE_NAME FROM ACHIEVEMENT;
  `;
  db.then((conn) => {
    conn
      .query(sqlQuery)
      .then((achievement) => {
        console.log(achievement);
        if (achievement.length !== 0) {
          res.render("achievements", {
            username: user,
            avatar: avatar,
            achievement: achievement,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

/**
 * LOGIN.
 * POST route handler for user authentication.
 * This route handler is responsible for authenticating a user based on the provided username and password.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.post("/api/auth", (req, res) => {
  const { username, password } = req.body;
  /** Check the provided username and password against the database. */
  if(!username){
    res.status(400).send("username not set");
  } else if (!password){
    res.status(400).send("password not set");
  }
  db.then((conn) => {
    conn
      .query(
        "SELECT USER_ID, USERNAME, PASSWORD, AVATAR_ID FROM USER WHERE USERNAME = ?",
        [username]
      )
      .then((rows) => {
        if (rows.length === 0) {
          res.status(401).send("user not found");
        } else {
          try {
            const id = rows[0].USER_ID;
            const username = rows[0].USERNAME;
            const password_fromDB = rows[0].PASSWORD;
            /** Haverland suggested improvements */
            const avatarID = rows[0].AVATAR_ID;
            const avatarPath = "/assets/emojis/" + "emoji_" + String(avatarID) + ".png";

            /** Compare the provided password with the hashed password stored in the database. */
            bcrypt.compare(password, password_fromDB).then((valid) => {
              if (valid) {
                try {
                  /** Generate a JWT token for authentication. */
                  const token = jwt.sign(
                    { id, username, avatarPath},
                    process.env.JWT_SECRET,
                    {
                      algorithm: "HS256",
                      expiresIn: "12h",
                      subject: "auth_token",
                    }
                  );
                  /** Set the JWT token as a cookie and redirect to the dashboard. */
                  res.cookie("accessToken", token, { httpOnly: false });
                  res.status(200).redirect("/");
                } catch (error) {
                  res.status(401).send("authentication failed");
                }
              } else {
                res.status(401).send("wrong password");
              }
            });
          } catch (error) {
            res.status(401).send("Wrong Login Credentials!");
          }
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(401).send("authentication failed");
      });
  });
});

/**
 * POST route handler for user registration.
 * This route handler is responsible for registering a new user.
 * It checks if the username already exists in the database.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;

  // To check a password between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter

  if (!pw.CheckPassword(String(password))) {
    res.status(400).send("Password does not match the Requirements!");
  } else {
    db.then((conn) => {
      conn
        .query("SELECT USERNAME FROM USER WHERE USERNAME = ?", [username])
        .then((rows) => {
          try {
            if (rows.length !== 0) {
              return res.status(401).send("User already exists");
            } else {
          
            let hashedPW = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const avatarID = Math.floor(Math.random() * 115 + 1);
            /** Haverland suggested improvements */
            const avatarPath = "/assets/emojis/" + "emoji_" + avatarID + ".png";
            conn
              .query(
                "INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID, WINS, CONCURRENT_WINS, PERFECT_WINS, LOSES) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [username, hashedPW, 0, avatarID, 0, 0, 0, 0]
              )
              .then((rows) => {
                conn
                  .query("SELECT USER_ID FROM USER WHERE USERNAME = ?", [
                    username,
                  ])
                  .then((rows) => {
                    try {
                      if (rows.length !== 0) {
                        let id = rows[0].USER_ID;

                        const token = jwt.sign(
                          { id, username, avatarPath },
                          process.env.JWT_SECRET,
                          {
                            algorithm: "HS256",
                            expiresIn: "12h",
                            subject: "auth_token",
                          }
                        );

                        res.cookie("accessToken", token, { httpOnly: false });
                        res.status(200).redirect("/index");
                      } else {
                        res.status(400).send("An Error has Occured!");
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  });
              })
              .catch((error) => {
                console.log(error);
                res.status(400).send(error);
              });
            }
          } catch (error) {
            console.log(error);
          }
        });
    });
  }
});

/**
 * GET route handler for accessing the scoreboard.
 * This route handler is responsible for accessing the scoreboard page.
 * It requires authentication token middleware function to be executed before handling the request.
 * The top 50 users with the highest scores are retrieved from the database and rendered on the scoreboard page.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/scoreboard", mw.authToken, (req, res) => { // avatar
  const username = req.username;
  const avatar = req.avatar;
  console.log("avatarDashboard" + avatar);

  const sqlQuery = `
  SELECT DISTINCT U.USERNAME, U.HIGHSCORE, U.WINS, U.CONCURRENT_WINS, U.PERFECT_WINS, U.LOSES, A.FILE_PATH
  FROM USER U
  INNER JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID
  ORDER BY U.HIGHSCORE DESC
  LIMIT 50;
  `;

  db.then((conn) => {
    conn
      .query(sqlQuery)
      .then((rows) => {
        //res.json(rows);
        res.render("scoreboard", {
          rows: rows,
          username: username,
          avatar: avatar,
        });
        conn.end();
      })
      .catch((error) => {
        console.log(error);
        conn.end();
        res.status(500).json({ error: "Internal Server Error" });
      });
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  });
});

/**
 * GET route handler for accessing the video file of Obi Wan Kenobi.
 * The video file is located in the "public/assets" directory with the filename "registered.mp4".
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
router.get("/video", (req, res) => {
  const videoPath = path.resolve(
    __dirname,
    "..",
    "public",
    "assets",
    "backgrounds",
    "registered.mp4"
  );
  res.sendFile(videoPath);
});

module.exports = router;
