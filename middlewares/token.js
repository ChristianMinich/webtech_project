
const svc = require("../services");

function validate(req, res, next) {
    const token = req.cookies["accessToken"]
    if (token === undefined) {
        res.redirect("/login");
        return;
    }
    try {
        let tokenData = svc.getData(token);
        if (tokenData) {
            res.locals.tokenData = tokenData;
            next();
        } else {
            res.status(401).json({message: "authentication error"});
        }
    } catch (e) {
        res.status(401).json({
            message: "authentication error: ",
            error: e.message
        });
    }
}

module.exports = {validate};