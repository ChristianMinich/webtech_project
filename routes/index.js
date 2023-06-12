/**
 * This file defines the main router for the application.
 * It sets up the necessary middleware, including JSON and URL-encoded body parsing,
 * cookie parsing, and static file serving.
 * It also includes a sub-router for handling authentication-related routes.
 */

const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");

const authRouter = require("./auth");

/** Parse incoming request bodies as JSON. */
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());

/** Include the authentication routes. */
router.use("/", authRouter);

/*router.get('*', (req, res) => {
    res.status(404).send('<h1 style="text-align: center;">404 Not Found</h1>');
    res.redirect()
}) */

/** Serve static files from the "public" directory. */
router.use(express.static("public", { extensions: ["html"] }));


module.exports = router;
