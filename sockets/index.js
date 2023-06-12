/**
 * This file contains the socket.io server logic for the quiz game.
 * It handles events related to players joining the game, loading the game page,
 * selecting answers to questions, leaving the game, and managing multiple game rooms.
 * The code uses a database connection to store and retrieve game-related data.
 */


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

  /** Handle socket connection event. */
  io.on("connection", (socket) => {
    /** Store user's IP address. */
    users[socket.id] = socket.request.connection.remoteAddress;

    /** Event handler for the case when an achievement is gained by a user. */
    socket.on("achievement_gained", (username) => {
      /** Query the database for the achievement details. */
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
                /** Emit the achievement details to the user. */
                socket.emit("getAchievement", String(achievementName));

                /** Delete the gained achievement entry from the database. */
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

    /** Event handler for when a user joins the queue. */
    socket.on("joinQueue", (username) => {
      /** Check if the user is already in the queue. */
      if (
        !queue.some(
          (item) => item.socket.id === socket.id || item.username === username
        )
      ) {
        queue.push({ socket: socket, username: username });
        io.emit("usersInQueue", username);
      } else {
        console.log("Benutzer bereits in der Warteschlange!");

        /** Remove the existing entry for the user in the queue. */
        const existingIndex = queue.findIndex(
          (item) => item.username === username
        );
        if (existingIndex !== -1) {
          queue.splice(existingIndex, 1);
          console.log("Alter Eintrag für Benutzer gelöscht: " + username);
        }
        /** Add the user to the queue again. */
        queue.push({ socket: socket, username: username });
      }
      /** Check if the queue has enough players to start a game. */
      if (queue.length >= MAX_PLAYERS_PER_ROOM) {
        /** Generate a unique room ID. */
        const roomId = generateRoomId();
        const players = [];

        /** Insert the active game entry into the database. */
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

        /** Assign players to the room and add them to the players array. */
        for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
          const { socket: playerSocket, username: playerUsername } =
            queue.shift();
          const playerId = playerSocket.id;
          players.push({ id: playerId, username: playerUsername, score: 0 });

          /** Join the player socket to the room. */
          playerSocket.join(roomId);

          console.log(players);
          console.log(roomId);
        }
        /** Create a room object and store it in the rooms map. */
        const room = { players: players, gameStarted: false };
        rooms.set(roomId, room);

        /** Emit the room ID to the players in the room. */
        io.to(roomId).emit("joinGame", roomId);
      } else {
      }
    });

    /** Event handler for when the game page is loaded by a player. */
    socket.on("gamePageLoaded", (roomId, username) => {
      console.log(username);

      const room = rooms.get(roomId);

      /** Check if the player is in the room. */
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

      /** Join the player socket to the room. */
      socket.join(roomId);

      /** Increment the game page loaded count. */
      gamePageLoadedCount++;
      playersinGame.push(username);
      console.log(gamePageLoadedCount + " Spieler Da! " + username);

      /** Check if all players have loaded the game page. */
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

    /** Event handler for the case when a player selects an answer to a question. */
    socket.on("questionSelected", (roomId, username, answer) => {
      const currGame = gameMap.get(roomId);
      currGame.answerQuestion(username, answer);
    });

    /** Event handler for the case when a player leaves the game. */
    socket.on("leaveGame", (roomId, username) => {
      console.log(
        "User: " + username + " hat das Spiel " + roomId + " verlassen"
      );
    });

    /** Event handler for the case when a player disconnects. */
    socket.on("disconnect", () => {
      console.log("user disconected");
      const disconnectedPlayer = queue.find(
        (item) => item.socket.id === socket.id
      );

      /** Check if the disconnected player is in the queue. */
      if (disconnectedPlayer) {
        const username = disconnectedPlayer.username;
        const playerIndex = queue.findIndex(
          (item) => item.username === username
        );
        if (playerIndex !== -1) {
          /** Remove the disconnected player from the queue. */
          queue.splice(playerIndex, 1);
          console.log(
            "Player disconnected and removed from queue: " + username
          );
        }
      }
      const player = runningGames.find((user) => user.socketId === socket.id);

      /** Check if the disconnected player is in a running game. */
      if (player) {
        console.log("Spieler hat das game verlassen");
        const currGame = gameMap.get(player.roomId);
        currGame.userDisconnect(player.username);
      }
    });
  });
};

/** Function to generate a unique room ID. */
function generateRoomId() {
  return uuidv4();
}
