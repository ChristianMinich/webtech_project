const express = require("express");
const router = express.Router();
const path = require('path');
const svc = require('../services');

router.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve('public/html/index.html'));
});

router.get('/index', (req, res) => {
    res.status(200).redirect('/');
});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.resolve('public/html/login.html'));
});

router.get('/logout', (req, res) => {
    res.clearCookie("accessToken");
    res.status(200).sendFile(path.resolve('public/html/registration.html'));
});

router.get('/register', (req, res) => {
    res.status(200).sendFile(path.resolve('public/html/register.html'));
});

router.get('/game', (req, res) => {
    res.sendFile(path.resolve('public/html/game.html'));
})

router.post("/api/auth", (req, res) => {
    const {username, password} = req.body;
    svc.login(username, password).then((response) => {
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
    }).catch(() => res.status(500).json({message: "authentication failed"}));
});

module.exports = router;