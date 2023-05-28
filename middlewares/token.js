const svc = require("../services");

function validate(req, res, next) {
  const token = req.cookies["accessToken"];
  if (token === undefined) {
    next();
    return;
  }
  try {
    if (isJWT(req.cookies.accessToken)) {
      const data = svc.getData(req.cookies.accessToken);
      res.render("dashboard", { user: data.username });
    }
  } catch (error) {
    console.log(error);
  }
}

function notValid(req, res, next){
  try{
    if(isJWT(req.cookies.accessToken)){
      next();
      return;
    }
  } catch (error) {
    res.status(200).redirect("/login");
  }
}

const isJWT = (token) => {
  if (typeof token !== "string" || !token) {
    return false;
  }

  const tokenParts = token.split(".");
  return (
    tokenParts.length === 3 && tokenParts[0] && tokenParts[1] && tokenParts[2]
  );
};

module.exports = { validate, notValid };
