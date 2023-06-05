const { v4: uuidv4 } = require('uuid');
const qs = require("../repositories/questions");
const QuizGame = require("../game/QuizGame");
const rooms = new Map();
const gameMap = new Map();
let gamePageLoadedCount = 0;

module.exports = (io) => {
  const users = {}; // Sichern der angemeldeten Clients u.A. für Nutzerlisten und Namensänderungen.
  const user = [];
  const MAX_PLAYERS_PER_ROOM = 2;
  const queue = [];
  const playersinRoom = [];
  const playersinGame = [];
   
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

    socket.on('joinQueue', (username) => {

      if (!queue.some((item) => item.socket.id === socket.id || item.username === username)) {
        queue.push({ socket: socket, username: username });
      } else {
        console.log("Benutzer bereits in der Warteschlange!");
        const existingIndex = queue.findIndex((item) => item.username === username);
        if (existingIndex !== -1) {
          queue.splice(existingIndex, 1);
        console.log("Alter Eintrag für Benutzer gelöscht: " + username);
        }     
        queue.push({ socket: socket, username: username });
      }
      //console.log("In der Warteschlange: " + socket.id);
      if (queue.length >= MAX_PLAYERS_PER_ROOM) {
        const roomId = generateRoomId();
        const players = [];
    
        for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
          const { socket: playerSocket, username: playerUsername } = queue.shift();
          const playerId = playerSocket.id;
          players.push({ id: playerId, username: playerUsername, score: 0 });
    
          // Spieler dem Raum hinzufügen
          playerSocket.join(roomId);
    
          console.log(players);
          console.log(roomId);
        }
        // Raum erstellen und speichern
        const room = { players: players, gameStarted: false };
        rooms.set(roomId, room);

        //Weiterleitung
        io.to(roomId).emit('joinGame', roomId);

      } else {
        socket.emit('usersInQueue', username);
      }
    });
    
    socket.on('gamePageLoaded',(roomId, username) => {
      socket.join(roomId);
      gamePageLoadedCount++;
      playersinGame.push(username);
      console.log("playersInGame Filled: " + playersinGame);
      console.log(gamePageLoadedCount + " Spieler Da! "+ username );
        // Überprüfen, ob alle Spieler die Bestätigungsnachricht gesendet haben
        if (playersinGame.length === MAX_PLAYERS_PER_ROOM) {
          gameMap.set(roomId, new QuizGame(roomId, io));
          gamePageLoadedCount = 0;
          console.log(roomId + " Spiel startet blad");
          const currGame = gameMap.get(roomId);
          
          playersinGame.forEach(player => {
            currGame.addPlayer(player);
            console.log("addedPlayer " + player);
          });

          playersinGame.splice(0, playersinGame.length);
          
          currGame.start();
          console.log(gameMap);
          console.log(currGame.toString());
        }
      });

    socket.on("questionSelected", (roomId, username, answer) => {

      const currGame = gameMap.get(roomId); 
      currGame.answerQuestion(username, answer);
      //console.log("Room: " + roomId +" | User: " + username + " hat gewählt: " + answer );

    });

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

function generateRoomId() {
  return uuidv4();
}