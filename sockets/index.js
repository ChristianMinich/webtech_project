const { v4: uuidv4 } = require('uuid');
const qs = require("../repositories/questions");
const QuizGame = require("../game/QuizGame");
const rooms = new Map();

module.exports = (io) => {
  const users = {}; // Sichern der angemeldeten Clients u.A. für Nutzerlisten und Namensänderungen.
  const user = [];
  const MAX_PLAYERS_PER_ROOM = 2;
  const queue = [];
  let gamePageLoadedCount = 0; 
  

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

    socket.on("joinQueu", (username) => {

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

    socket.on('joinQueue', (username) => {
      
      if(!queue.includes(socket)){
        queue.push(socket);
      }
      else{
        console.log("user schon in queue!")
      }

      console.log("In Warteschlange " + socket);
      if (queue.length >= MAX_PLAYERS_PER_ROOM) {
        const roomId = generateRoomId();
        const players = [];
  
        for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
          const playerSocket = queue.shift();
          const playerId = playerSocket.id;
          players.push({ id: playerId, score: 0 });
  
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
         
        io.to(roomId).emit('joinGame', roomId);
        io.to(roomId).emit('question', logques());
        
        //startGame(roomId);
      } else {
        socket.emit('usersInQueue', username);
      }
    });

    socket.on("gamePageLoaded", () => {

      gamePageLoadedCount++;
      console.log(gamePageLoadedCount);

        // Überprüfen, ob alle Spieler die Bestätigungsnachricht gesendet haben
        if (gamePageLoadedCount === MAX_PLAYERS_PER_ROOM) {
          //startGame(roomId);
          console.log("Spiel gestartet");
          gamePageLoadedCount = 0; 
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

function getQuestions() {

  const ques = [];

  for(let i = 0; i < 5; i++){

    ques[i] = qs.getQuestions(Math.random()* 20); 
  }
return ques;
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