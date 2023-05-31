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

router.get("/", mw.dashboard,(req, res) => {
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

router.get("/game", mw.authToken,(req, res) => {
  res.sendFile(path.resolve("public/game.html"));
});

router.get("/joinQueue", mw.authToken, (req, res) => {
  const username = req.username;
  res.render("queue", {username: username});
})

router.get('/game/:roomID', mw.authToken, mw.avatar,(req, res) => {
  const roomID = req.params.roomID;
  const username = req.username;
  const avatar = req.avatar;
  // Here, you can render the desired EJS template for the game page
  res.render('game', { roomID: roomID,  username: username, avatar: avatar});
});

//SELECT DISTINCT USERNAME, HIGHSCORE FROM USER WHERE USERNAME = ?
router.get("/profile/:username", mw.authToken, mw.avatar,(req, res) => {
  const username = req.params.username;
  const user = req.username;
  // const avatar = req.avatar; // get User Avatar

  console.log("username " + username);
  console.log("user " + user);
  //console.log("avatar " + avatar);
  db.then(conn => {
    conn.query("SELECT DISTINCT U.USERNAME, U.HIGHSCORE, A.FILE_PATH FROM USER U INNER JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID WHERE U.USERNAME = ?", [username])
    .then(rows => {
      try{
        const avatar = rows[0].FILE_PATH
        res.render("profile", { rows: rows , username: user, avatar: avatar});
      } catch (error){
        console.log(error);
      }
    })
  })
});

router.post("/api/auth", (req, res) => {
  const { username, password } = req.body;
  db.then((conn) => {
    conn
      .query("SELECT USERNAME, PASSWORD FROM USER WHERE USERNAME = ?", [
        username,
      ])
      .then((rows) => {
        console.log(rows);
        if (rows.length === 0) res.status(401).send("Wrong Login Credentials!");
        bcrypt
          .compare(password, rows[0].PASSWORD)
          .then((valid) => {
            console.log(valid);
            if (valid && rows[0].USERNAME == username) {
              conn
                .query("SELECT USER_ID FROM USER WHERE USERNAME = ?", [
                  username,
                ])
                .then((rows) => {
                  console.log(rows);
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
                      res.status(200).redirect("/");
                    } else {
                      res.status(400).send("An Error has Occured!");
                    }
                  } catch (error) {
                    console.log(error);
                  }
                });
            } else {
              res.status(400).send("Invalid Request");
            }
          })
          .catch((error) => {
            res.status(403).send(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

router.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;

// To check a password between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter


  if(!pw.CheckPassword(password)){
    res.status(400).send("Password does not match the Requirements!");
  }

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

          conn
            .query(
              "INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES (?, ?, ?, ?)",
              [username, hashedPW, 0, 1]
            )
            .then((rows) => {
              console.log(rows);
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
      .query("SELECT DISTINCT U.USERNAME, U.HIGHSCORE, A.FILE_PATH FROM USER U INNER JOIN AVATAR A ON U.AVATAR_ID = A.AVATAR_ID ORDER BY U.HIGHSCORE DESC LIMIT 15")
      .then((rows) => {

        //res.json(rows);
        res.render("scoreboard", { rows: rows , username: username});
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

router.get('/video', (req, res) => {
  // Replace 'path/to/video.mp4' with the path to your video file
  const videoPath = path.resolve(__dirname, '..', 'public', 'assets', 'registered.mp4');
  res.sendFile(videoPath);
});

router.get('/registered', (req, res) => {
  res.send(`
  <html>
  <head>
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .table-container {
        display: flex;
        justify-content: center;
      }
    </style>
  </head>
  <body>
      <div class="table-container">
      <table margin: auto display>
        <tr>
          <td>
            <video id="myVideo" muted style="display: block; margin: 0 auto;">
              <source src="/video" type="video/mp4">
            </video>
          </td>
        </tr>
        <tr>
          <td>
          <button id="playButton">Continue</button>
          </td>
        </tr>
      </table>
      </div>
    <script>
      const video = document.querySelector('#myVideo');
      const playButton = document.querySelector('#playButton');

      video.muted = false;
      video.play();

      playButton.addEventListener('click', () => {
        video.play();
        video.muted = false; // Unmute the video once it starts playing
      });

      video.addEventListener('ended', () => {
        window.location.href = 'http://131.173.65.77:3000'; // Redirect to another site
      });
    </script>
  </body>
</html>
  `);
});

module.exports = router;
