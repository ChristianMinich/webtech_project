/**
 * This file exports utility functions for handling user authentication and avatar retrieval.
 * It includes functions related to token authentication and rendering the dashboard, as well as retrieving avatars.
 */

const token = require("./token");
const avatar = require("./avatar");

module.exports = {
  dashboard: token.renderDashboard,
  authToken: token.authenticateToken,
  avatar: avatar.getAvatar,
};
