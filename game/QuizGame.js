const shuffle = require('shuffle-array');

class QuizGame {
  constructor(questions, io) {
    this.questions = questions;
    this.currentQuestion = null;
    this.players = [];
    this.io = io;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter((player) => player.id !== playerId);
  }

  startGame() {
    shuffle(this.questions);
    this.players.forEach((player) => {
      player.score = 0;
    });
    this.sendQuestion();
  }

  sendQuestion() {
    if (this.questions.length > 0) {
      this.currentQuestion = this.questions.shift();
      this.io.emit('question', this.currentQuestion);
    } else {
      this.endGame();
    }
  }

  answerQuestion(playerId, answer) {
    const player = this.players.find((player) => player.id === playerId);
    if (!player) {
      // Player not found, handle the error or perform any necessary actions
      return;
    }

    if (!this.currentQuestion) {
      // No current question, handle the error or perform any necessary actions
      return;
    }

    if (answer === this.currentQuestion.correctAnswer) {
      player.score += 1;
      this.io.to(playerId).emit('answer', { correct: true });
    } else {
      this.io.to(playerId).emit('answer', { correct: false });
    }

    this.sendQuestion();
  }

  endGame() {
    this.players.forEach((player) => {
      this.io.to(player.id).emit('gameEnd', { score: player.score });
    });
  }
}

module.exports = QuizGame;
