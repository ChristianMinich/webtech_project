const svc = require("../services");

function renderDashboard(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (accessToken) {
    try {
      const decoded = svc.getData(accessToken);

      const user = decoded.username;

      return res.render("dashboard", { user: user });
    } catch (err) {
      return next();
    }
  }
  next();
}

function authenticateToken(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken) {
    console.log("redirected!");
    return res.redirect("/login");
  }

  try {
    const decoded = svc.getData(accessToken);
    console.log(decoded);
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

module.exports = { authenticateToken, renderDashboard };
