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

router.get("/", mw.dashboard, (req, res) => {
  res.status(200).sendFile(path.resolve("public/index.html"));
});

router.get("/index", (req, res) => {
  res.status(200).redirect("/");
});

router.get("/login", mw.dashboard, (req, res) => {
  res.status(200).sendFile(path.resolve("public/login.html"));
});

router.get("/logout", (req, res) => {
  res.clearCookie("accessToken");
  //res.status(200).redirect("/login");
  res.sendFile(path.resolve("public/login.html"));
});

router.get("/register", mw.dashboard, (req, res) => {
  res.status(200).sendFile(path.resolve("public/register.html"));
});

router.get("/game", mw.authToken, (req, res) => {
  res.sendFile(path.resolve("public/game.html"));
});

router.get("/joinQueue", mw.authToken, (req, res) => {
  const username = req.username;
  res.render("queue", { username: username });
});

router.get("/game/:roomID", mw.authToken, mw.avatar, (req, res) => {
  const roomID = req.params.roomID;
  const username = req.username;
  const avatar = req.avatar;
  // Here, you can render the desired EJS template for the game page
  res.render("game", { roomID: roomID, username: username, avatar: avatar });
});

//SELECT DISTINCT USERNAME, HIGHSCORE FROM USER WHERE USERNAME = ?
router.get("/profile/:username", mw.authToken, mw.avatar, (req, res) => {
  const username = req.params.username;
  const user = req.username;
  // const avatar = req.avatar; // get User Avatar

  console.log("username " + username);
  console.log("user " + user);
  //console.log("avatar " + avatar);
  db.then((conn) => {
    conn
      .query(
        "SELECT DISTINCT U.USERNAME, U.HIGHSCORE, A.FILE_PATH FROM USER U INNER JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID WHERE U.USERNAME = ?",
        [username]
      )
      .then((rows) => {
        try {
          const avatar = rows[0].FILE_PATH;
          res.render("profile", { rows: rows, username: user, avatar: avatar });
        } catch (error) {
          console.log(error);
        }
      });
  });
});

router.post("/api/auth", (req, res) => {
  const { username, password } = req.body;
  db.then((conn) => {
    conn
      .query(
        "SELECT USER_ID, USERNAME, PASSWORD FROM USER WHERE USERNAME = ?",
        [username]
      )
      .then((rows) => {
        if (rows.length === 0) {
          res.status(401).send("Wrong Login Credentials!");
        } else {
          try {
            const id = rows[0].USER_ID;
            const username = rows[0].USERNAME;
            const password_fromDB = rows[0].PASSWORD;


            bcrypt.compare(password, password_fromDB).then((valid) => {
              if (valid) {
                try {
                  const token = jwt.sign(
                    { id, username },
                    process.env.JWT_SECRET,
                    {
                      algorithm: "HS256",
                      expiresIn: "12h",
                      subject: "auth_token",
                    }
                  );

                  res.cookie("accessToken", token, { httpOnly: false });
                  res.status(200).redirect("/");
                } catch (error) {
                  res.status(401).send("Wrong Login Credentials!");
                }
              } else {
                res.status(401).send("Wrong Login Credentials!");
              }
            });
          } catch (error) {
            res.status(401).send("Wrong Login Credentials!");
          }
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(401).send("Wrong Login Credentials!");
      });
  });
});

router.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;

  // To check a password between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter

  /*
  if(!pw.CheckPassword(String(password))){
    res.status(400).send("Password does not match the Requirements!");
  } */

  db.then((conn) => {
    conn
      .query("SELECT USERNAME FROM USER WHERE USERNAME = ?", [username])
      .then((rows) => {
        try {
          if (rows[0].USERNAME !== 0) {
            return res.send("User already exists");
          }
        } catch (error) {
          let hashedPW = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
          const avatarID = Math.floor(Math.random() * 115 + 1);
          conn
            .query(
              "INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES (?, ?, ?, ?)",
              [username, hashedPW, 0, avatarID]
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
                        { id, username },
                        process.env.JWT_SECRET,
                        {
                          algorithm: "HS256",
                          expiresIn: "12h",
                          subject: "auth_token",
                        }
                      );

                      res.cookie("accessToken", token, { httpOnly: false });
                      res.status(200).redirect("/registered");
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
      });
  });
});

router.get("/scoreboard", mw.authToken, (req, res) => {
  const username = req.username;
  db.then((conn) => {
    conn
      .query(
        "SELECT DISTINCT U.USERNAME, U.HIGHSCORE, A.FILE_PATH FROM USER U INNER JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID ORDER BY U.HIGHSCORE DESC LIMIT 50"
      )
      .then((rows) => {
        //res.json(rows);
        res.render("scoreboard", { rows: rows, username: username });
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

router.get("/video", (req, res) => {
  const videoPath = path.resolve(
    __dirname,
    "..",
    "public",
    "assets",
    "registered.mp4"
  );
  res.sendFile(videoPath);
});

router.get("/registered", (req, res) => {
  res.status(200).sendFile(path.resolve("public/registered.html"));
});

module.exports = router;
