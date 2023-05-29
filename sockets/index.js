const { v4: uuidv4 } = require('uuid');
const qs = require("../repositories/questions");
module.exports = (io) => {
  const users = {}; // Sichern der angemeldeten Clients u.A. für Nutzerlisten und Namensänderungen.
  const user = [];

  console.log("hello there");

  io.on("connection", (socket) => {
    //console.log(socket.id);
    //console.log(socket.request.session);
    users[socket.id] = socket.request.connection.remoteAddress;
    //console.log(users);
    // Ereignisbehandlung: Neuer Benutzer meldet sich an.
    socket.on("new-user", (name) => {
      users[socket.id] = name;
      socket.broadcast.emit("user-connected", name);
      io.emit("all-connections", JSON.stringify(users));
    });

    socket.on("joinQueue", (username) => {

      if(!user.includes(username)){
        user.push(username);
        io.emit("usersInQueue", user);
      }
      console.log("In Queue: " + username);
      console.log("user: " + user);
      if (user.length === 4){
        const roomID = uuidv4();
        console.log("joining Game" + user.length);
        io.emit("joinGame", roomID);
        user.length = 0;
      }
    });

    socket.on("questions", () => {
      qs.getQuestions(2);
    });

    socket.on("join-queue", (username) => {
      // Add User to Array
      // if Array >= 2 emit
      // 2 Users to Game
      // and Remove from Array
      // io.emit("join-game", gameID);
    });

    socket.on("questionSelected", (gameID, username) => {});

    // Ereignisbehandlung: Nachricht wurde gesendet (Vom Client an Server).
    socket.on("send-chat-message", (message) => {
      socket.broadcast.emit("chat-message", {
        message: message,
        name: users[socket.id],
      });
    });

    // Ereignisbehandlung: Name wurde geändert.
    socket.on("send-new-username", (name) => {
      let oldName = users[socket.id];
      users[socket.id] = name;
      socket.broadcast.emit("username-changed", {
        oldName: oldName,
        newName: name,
      });
      io.emit("all-connections", JSON.stringify(users));
    });

    // Ereignisbehandlung: Verbindung getrennt.
    socket.on("disconnect", () => {
      socket.broadcast.emit("user-disconnected", users[socket.id]);
      delete users[socket.id];
      io.emit("all-connections", JSON.stringify(users));
    });
  });
};
