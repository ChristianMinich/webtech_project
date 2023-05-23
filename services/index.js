require("dotenv").config();
const queries = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(username, password) {
    if (!username) {
        return {status: 400, message: "username not set"};
    } else if (!password) {
        return {status: 400, message: "password not set"};
    } else {
        return await queries.getUserByName(username).then((user) => {
            if (user) {
                return bcrypt.compare(password, user.password)
                    .then((valid) => {
                        if (valid) {
                            let id = user.id;
                            const token = jwt.sign({id, username}, process.env.JWT_SECRET, {
                                algorithm: "HS256",
                                expiresIn: "12h",
                                subject: "auth_token"
                            });
                            return {status: 200, message: "login successful", token: token};
                        } else {
                            return {status: 401, message: "wrong password"};
                        }
                    }).catch(() => {
                        return {status: 500, message: "authentication failed"};
                    });
            } else {
                return {status: 401, message: "user not found"};
            }
        }).catch(() => {
            return {status: 500, message: "authentication failed"};
        });
    }
}

async function register(){

}

function getData(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

async function createUser(username, password) {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return console.error(err.message);
        queries.createUser(username, hash);
    });
}

module.exports = {login, getData, register};