/**
 * This file provides utility functions for working with JSON Web Tokens (JWT).
 * It includes a function to extract data from a JWT token by decoding and verifying it.
 * The extracted data can be used for further processing or authentication purposes.
 */


require("dotenv").config();
const queries = require("../repositories/userRepository");
const jwt = require("jsonwebtoken");

/**
 * Extracts data from a JWT token.
 *
 * @param {string} token - The JWT token to decode and verify.
 * @returns {object} - The decoded data from the JWT token.
 */
function getData(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { getData };
