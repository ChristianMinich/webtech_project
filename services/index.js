require("dotenv").config();
const queries = require("../repositories/userRepository");
const jwt = require("jsonwebtoken");

function getData(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { getData };
