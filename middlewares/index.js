const token = require("./token");
const avatar = require("./avatar");

module.exports = {
  dashboard: token.renderDashboard,
  authToken: token.authenticateToken,
  avatar: avatar.getAvatar,
};
