const { v4: uuidv4 } = require("uuid");
const database = require("../repositories");
const QuizGame = require("../game/QuizGame");
const rooms = new Map();
const gameMap = new Map();
let gamePageLoadedCount = 0;

const db = database.getConnection();

module.exports = (io) => {
  const users = {};
  const MAX_PLAYERS_PER_ROOM = 2;
  const queue = [];
  const playersinGame = [];
  const runningGames = [];

  io.on("connection", (socket) => {
    users[socket.id] = socket.request.connection.remoteAddress;
    socket.on("new-user", (name) => {
      users[socket.id] = name;
      socket.broadcast.emit("user-connected", name);
      io.emit("all-connections", JSON.stringify(users));
    });

    socket.on("achievement_gained", (username) => {
      const sqlQuery = `
        SELECT a.FILE_NAME
        FROM ACHIEVEMENT_GAINED ag
        JOIN ACHIEVEMENT a ON ag.ACHIEVEMENT_ID = a.ACHIEVEMENT_ID
        WHERE ag.USERNAME = '${username}';
        `;
      db.then((conn) => {
        conn
          .query(sqlQuery)
          .then((rows) => {
            try {
              if (typeof rows[0].FILE_NAME !== undefined) {
                const achievementName = rows[0].FILE_NAME;
                socket.emit("getAchievement", String(achievementName));

                conn
                  .query("DELETE FROM ACHIEVEMENT_GAINED WHERE USERNAME = ?", [
                    username,
                  ])
                  .catch((error) => {
                    console.log(error);
                  });
              }
            } catch (error) {}
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

    socket.on("joinQueue", (username) => {
      if (
        !queue.some(
          (item) => item.socket.id === socket.id || item.username === username
        )
      ) {
        queue.push({ socket: socket, username: username });
        io.emit("usersInQueue", username);
      } else {
        console.log("Benutzer bereits in der Warteschlange!");
        const existingIndex = queue.findIndex(
          (item) => item.username === username
        );
        if (existingIndex !== -1) {
          queue.splice(existingIndex, 1);
          console.log("Alter Eintrag für Benutzer gelöscht: " + username);
        }
        queue.push({ socket: socket, username: username });
      }
      if (queue.length >= MAX_PLAYERS_PER_ROOM) {
        const roomId = generateRoomId();
        const players = [];

        db.then((conn) => {
          conn
            .query("INSERT INTO ACTIVE_GAME (ROOM_ID) VALUES (?)", [roomId])
            .then((rows) => {
              console.log(rows);
            })
            .catch((error) => {
              console.log(error);
            });
        });

        for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
          const { socket: playerSocket, username: playerUsername } =
            queue.shift();
          const playerId = playerSocket.id;
          players.push({ id: playerId, username: playerUsername, score: 0 });

          playerSocket.join(roomId);

          console.log(players);
          console.log(roomId);
        }
        const room = { players: players, gameStarted: false };
        rooms.set(roomId, room);

        io.to(roomId).emit("joinGame", roomId);
      } else {
      }
    });

    socket.on("gamePageLoaded", (roomId, username) => {
      console.log(username);

      const room = rooms.get(roomId);

      if (!room.players.some((player) => player.username === username)) {
        console.log("Flascher User im Game! " + username);
        console.log(socket.id);
        io.to(socket.id).emit("wrongUser");
        return;
      }
      const user = {
        socketId: socket.id,
        username: username,
        roomId: roomId,
      };
      runningGames.push(user);
      console.log(user.socketId + "|" + user.username);

      socket.join(roomId);
      gamePageLoadedCount++;
      playersinGame.push(username);
      console.log(gamePageLoadedCount + " Spieler Da! " + username);
      if (playersinGame.length === MAX_PLAYERS_PER_ROOM) {
        gameMap.set(roomId, new QuizGame(roomId, io));
        gamePageLoadedCount = 0;
        console.log(roomId + " Spiel startet blad");
        const currGame = gameMap.get(roomId);

        playersinGame.forEach((player) => {
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
    });

    socket.on("send-chat-message", (message) => {
      socket.broadcast.emit("chat-message", {
        message: message,
        name: users[socket.id],
      });
    });

    socket.on("send-new-username", (name) => {
      let oldName = users[socket.id];
      users[socket.id] = name;
      socket.broadcast.emit("username-changed", {
        oldName: oldName,
        newName: name,
      });
      io.emit("all-connections", JSON.stringify(users));
    });
    socket.on("leaveGame", (roomId, username) => {
      console.log(
        "User: " + username + " hat das Spiel " + roomId + " verlassen"
      );
    });
    socket.on("disconnect", () => {
      console.log("user disconected");
      const disconnectedPlayer = queue.find(
        (item) => item.socket.id === socket.id
      );
      if (disconnectedPlayer) {
        const username = disconnectedPlayer.username;
        const playerIndex = queue.findIndex(
          (item) => item.username === username
        );
        if (playerIndex !== -1) {
          queue.splice(playerIndex, 1);
          console.log(
            "Player disconnected and removed from queue: " + username
          );
        }
      }
      const player = runningGames.find((user) => user.socketId === socket.id);
      if (player) {
        console.log("Spieler hat das game verlassen");
        const currGame = gameMap.get(player.roomId);
        currGame.userDisconnect(player.username);
      }
    });
  });
};

function generateRoomId() {
  return uuidv4();
}
