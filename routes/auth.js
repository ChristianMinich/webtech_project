const express = require("express");
const router = express.Router();
const path = require('path');
const svc = require('../services');
const database = require('../repositories/index');
const db = database.getConnection();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve('public/index.html'));
    try{
        if (isJWT(req.cookies.accessToken)){
        const data = svc.getData(req.cookies.accessToken);

        res.render('dashboard', {user: data.username });
        }
    }catch (error){
        console.log(error);
    }
});

router.get('/index', (req, res) => {
    res.status(200).redirect('/');
});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.resolve('public/login.html'));
});

router.get('/logout', (req, res) => {
    res.clearCookie("accessToken");
    res.status(200).redirect('/login');
});

router.get('/game-test', (req, res) => {
    res.render('game.ejs');
});

router.get('/scoreboard', (req, res) => {
    res.status(200).sendFile(path.resolve('public/scoreboard.html'));
});

router.get('/register', (req, res) => {
    res.status(200).sendFile(path.resolve('public/register.html'));
});

router.get('/game', (req, res) => {
    res.sendFile(path.resolve('public/game.html'));
});

router.post("/api/auth", (req, res) => {
    const {username, password} = req.body;
    db.then(conn => {
        conn.query('SELECT USERNAME, PASSWORD FROM USER WHERE USERNAME = ?', [username])
        .then(rows => {
            console.log(rows);
            if(rows.length === 0) res.status(401).send('Wrong Login Credentials!');
            bcrypt.compare(password, rows[0].PASSWORD)
            .then((valid) => {
                console.log(valid);
                if(valid && rows[0].USERNAME == username){

                    conn.query('SELECT USER_ID FROM USER WHERE USERNAME = ?', [username])
                    .then(rows => {
                        console.log(rows);
                        try{
                            if(rows.length !== 0){
    
                                let id = rows[0].USER_ID
    
                                const token = jwt.sign({id, username}, process.env.JWT_SECRET, {
                                    algorithm: "HS256",
                                    expiresIn: "12h",
                                    subject: "auth_token"
                                });
    
                                res.cookie("accessToken", token, {httpOnly: false});
                                res.status(200).redirect('/');
                            } else {
                                res.status(400).send("An Error has Occured!");
                            }
                                
                            } catch (error) {
                                console.log(error);
                            }
                    })

                } else {
                    res.status(400).send("Invalid Request");
                }
            }).catch(error => {
                res.status(403).send(error);
            })
        }).catch(error => {
            console.log(error);
        })
    })
});

router.post("/api/auth/register", (req, res) => {
    const {username, password} = req.body;
    db.then(conn => {
        conn.query('SELECT USERNAME FROM USER WHERE USERNAME = ?', [username])
        .then(rows => {
            try{
            if(rows[0].USERNAME !== 0) {
                return res.send("User already exists");
            }
            } catch (error){
            
            let hashedPW = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

            conn.query('INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES (?, ?, ?, ?)', [username, hashedPW, 0, 1])
            .then(rows => {
                console.log(rows);
                conn.query('SELECT USER_ID FROM USER WHERE USERNAME = ?', [username])
                .then(rows => {
                    
                    try{
                        if(rows.length !== 0){

                            let id = rows[0].USER_ID

                            const token = jwt.sign({id, username}, process.env.JWT_SECRET, {
                                algorithm: "HS256",
                                expiresIn: "12h",
                                subject: "auth_token"
                            });

                            res.cookie("accessToken", token, {httpOnly: false});
                            res.status(200).redirect('/');
                        } else {
                            res.status(400).send("An Error has Occured!");
                        }
                            
                        } catch (error) {
                            console.log(error);
                        }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send(error);
            })
        }
        })
    })

});

router.get('/scoreboard', (req, res) => {
      db.then(conn => {
        conn.query('SELECT USERNAME, HIGHSCORE FROM USER ORDER BY HIGHSCORE LIMIT 10')
          .then(rows => {
            res.json(rows);
            conn.end();
          })
          .catch(error => {
            console.log(error);
            conn.end();
            res.status(500).json({ error: 'Internal Server Error' });
          });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
});

const isJWT = (token) => {
    if (typeof token !== 'string' || !token) {
      return false;
    }
  
    const tokenParts = token.split('.');
    return tokenParts.length === 3 && tokenParts[0] && tokenParts[1] && tokenParts[2];
  };  

module.exports = router;