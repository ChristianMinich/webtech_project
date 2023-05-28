const token = require("./token");

module.exports = { dashboard: token.renderDashboard,  authToken: token.authenticateToken};
