const QuizGame = require('./QuizGame'); // Assuming the QuizGame class is in a separate file

const questions = [
  { question: 'Question 1', correctAnswer: 'A' },
  { question: 'Question 2', correctAnswer: 'B' },
  { question: 'Question 3', correctAnswer: 'C' },
  // Add more questions as needed
];

const io = require('socket.io')(); // Initialize Socket.IO server instance

const game = new QuizGame(questions, io);

// Socket.IO event handlers for player connections, disconnections, and answers
io.on('connection', (socket) => {
  const playerId = socket.id;

  // Add the player to the game
  game.addPlayer({ id: playerId, score: 0 });

  // Start the game when all players are ready
  if (game.players.length >= 2) {
    game.startGame();
  }

  socket.on('answer', (answer) => {
    // Process the player's answer
    game.answerQuestion(playerId, answer);
  });

  socket.on('disconnect', () => {
    // Remove the player from the game on disconnection
    game.removePlayer(playerId);
  });
});

// Start the Socket.IO server
io.listen(3000); // Replace with the desired port number
