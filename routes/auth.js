const express = require("express");
const router = express.Router();
const path = require('path');
const svc = require('../services');
const database = require('../repositories/index');
const db = database.getConnection();
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve('public/index.html'));
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
    /*svc.login(username, password).then((response) => {
        if (response) {
            if (response.token) {
                res.cookie("accessToken", response.token, {httpOnly: false});
                res.redirect("/");
            } else {
                if (response.status) res.status(response.status);
                if (response.message) res.send(response.message)
                res.end();
            }
        }
    }).catch(() => res.status(500).json({message: "authentication failed"})); */

    db.then(conn => {
        conn.query('SELECT USERNAME, PASSWORD FROM USER WHERE USERNAME = ?', [username])
        .then(rows => {
            if(rows.length === 0) res.status(401).send('Wrong Login Credentials!');
            bcrypt.compare(password, user.password)
            .then((valid) => {
                if(valid && rows[0].USERNAME == username){
                    const token = jwt.sign({id, username}, process.env.JWT_SECRET, {
                        algorithm: "HS256",
                        expiresIn: "12h",
                        subject: "auth_token"
                    });

                        res.cookie("accessToken", token, {httpOnly: false});
                        res.status(200).redirect("/index");

                }
            }).catch(error => {
                res.status(403).send(error);
            })
        }).catch(error => {
            res.status(403).send(error);
        })
    })
});

router.post("/api/auth/register", (req, res) => {
    const {username, password} = req.body;
    /*svc.register(username, password).then((response) => {
        if (response) {
            if (response.token) {
                res.cookie("accessToken", response.token, {httpOnly: false});
                res.redirect("/");
            } else {
                if (response.status) res.status(response.status);
                if (response.message) res.send(response.message)
                res.end();
            }
        }
    }).catch(() => res.status(500).json({message: "authentication failed"})); */

    db.then(conn => {
        conn.query('SELECT USERNAME FROM USER WHERE USERNAME = ?', [username])
        .then(rows => {
            if(rows[0].USERNAME !== 0) return res.status(400).send("User already exists");

            // Funktioniert noch nicht
            let hashedPW = bcrypt.hash(password, process.env.JWT_SECRET, (error, hash) => {
                if(error) res.status(400).send(error);
                return hash;
            })

            conn.query('INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES (?, ?, ?, ?)', [username, hashedPW, 0, null])
            .then(rows => {
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
                            res.status(200).redirect("/index");
                        } else {
                            res.status(400).send("An Error has Occured!");
                        }
                            
                        } catch (error) {
                            console.log(erorr);
                        }
                })
            })
            .catch(error => {
                res.status(400).send(error);
            })

        })
    })

});

module.exports = router;