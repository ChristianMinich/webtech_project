const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');

const authRouter = require('./auth');

router.use(express.json());
router.use(express.urlencoded({extended: false}));
router.use(cookieParser());

router.use('/', authRouter);

/*router.get('*', (req, res) => {
    res.status(404).send('<h1 style="text-align: center;">404 Not Found</h1>');
    res.redirect()
}) */

router.use(express.static("public", {extensions: ["html"]}));

module.exports = router;