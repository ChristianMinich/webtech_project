const express = require('express');
const app = express();
const http = require('http').Server(app);

app.set("views", "views");
app.set("view engine", "ejs");

const routes = require("./routes");
app.use("/", routes);

http.listen(3000, () => {
    console.log('Server startet at localhost:3000');
})