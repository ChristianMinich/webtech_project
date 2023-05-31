const { v4: uuidv4 } = require('uuid');
const qs = require("../repositories/questions");
const QuizGame = require("../game/QuizGame");
const rooms = new Map();
let gamePageLoadedCount = 0;

module.exports = (io) => {
  const users = {}; // Sichern der angemeldeten Clients u.A. für Nutzerlisten und Namensänderungen.
  const user = [];
  const MAX_PLAYERS_PER_ROOM = 2;
  const queue = [];
   
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
      if (!queue.some((item) => item.socket.id === socket.id)) {
        queue.push({ socket: socket, username: username });
      } else {
        console.log("Benutzer bereits in der Warteschlange!");
      }
    
      console.log("In der Warteschlange: " + socket.id);
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
    
        // Spiel starten
        //const game = new QuizGame.QuizGame(roomId);
    
        //Weiterleitung
        //io.to(roomId).emit('joinGame', roomId);
        //Test der Fragen auf Queue seite 
        getNextQuestion().then(question => {
          console.log(question);
          //io.sockets.in(roomId).emit('question', question);
          io.to(roomId).emit("question", question);
        }).catch(error => {
          console.log('Fehler beim Abrufen der Frage:', error);
        });
        //Ende Test
        //startGame(roomId);
      } else {
        socket.emit('usersInQueue', username);
      }
    });
    
    socket.on('gamePageLoaded', (roomId) => {

      gamePageLoadedCount++;
      console.log(gamePageLoadedCount + " Spieler Da!");
        // Überprüfen, ob alle Spieler die Bestätigungsnachricht gesendet haben
        if (gamePageLoadedCount === MAX_PLAYERS_PER_ROOM) {
          //console.log("Spiel gestartet");
          gamePageLoadedCount = 0;
          console.log(roomId + " Spiel startet blad");
          //const quiz = new QuizGame(roomId);
          //quiz.start();

          getNextQuestion().then(question => {
            console.log(question);
            //io.to(roomId).emit('question', question);
            //io.sockets.in(String(roomId)).emit("question", question);
            //io.emit("test", roomId);
            io.emit('question', question);
            //io.sockets.in(roomId).emit('question', question);
            //io.to(String(roomId)).emit("test", roomId);
          }).catch(error => {
            console.log('Fehler beim Abrufen der Frage:', error);
          });
        }
      });

    //socket.on("gameStart")

    socket.on("questions", () => {
      qs.getQuestions(2);
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

function generateRoomId() {
  return uuidv4();
}

async function getRandomQuestions() {
  try {
      const questions = [];
      const questionIDs = [1, 2, 3, 4, 5]; // Replace with actual question IDs or generate dynamically

      for (let i = 0; i < 5; i++) {
          const randomIndex = Math.floor(Math.random() * questionIDs.length);
          const questionID = questionIDs[randomIndex];
          const result = await qs.getQuestions(questionID);
          questions.push(result[0]); // Assuming only one row is returned for each questionID
      }

      return questions;
  } catch (error) {
      console.log(error);
      return []; // Return an empty array in case of error
  }
}

async function logques() {
  try {
    const randomQuestions = await getRandomQuestions();
    //console.log(randomQuestions);
    randomQuestions.forEach(element => {
      console.log(element.QUESTION);
    });
    return randomQuestions;
  } catch (error) {
    console.log(error);
  }
}

async function getNextQuestion() {
  try {
    const randomQuestionID = Math.floor(Math.random() * 20) + 1; // Beispiel: Zufällige Frage ID generieren
    const rows = await qs.getQuestions(randomQuestionID);

    if (rows.length > 0) {
      const questionRow = rows[0]; // Nehmen Sie die erste Zeile als Frage an
      
      const question = {
        id: questionRow.QUESTION_ID,
        text: questionRow.QUESTION,
        answers: [
          questionRow.RIGHT_ANSWER,
          questionRow.FALSE_ANSWER1,
          questionRow.FALSE_ANSWER2,
          questionRow.FALSE_ANSWER3
        ],
        category: questionRow.CATEGORY_ID
      };

      return question;
    }
  } catch (error) {
    console.log('Fehler beim Abrufen der nächsten Frage:', error);
  }

  return null; // Falls keine Frage abgerufen werden kann, wird null zurückgegeben
}