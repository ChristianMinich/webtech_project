const express = require('express');
const app = express();
const http = require('http').Server(app);

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const routes = require("./routes");
app.use("/", routes);

const io = require("socket.io")(http);
const sockets = require("./sockets");
sockets(io);

http.listen(3000, () => {
    console.log('Server startet at localhost:3000');
})