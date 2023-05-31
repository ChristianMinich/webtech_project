const qs = require("../repositories/questions");
//const io = require("../sockets/index");

class QuizGame {
  constructor(roomId, io) {
    this.io = io;
    this.roomId = roomId;
    this.questions = []; 
    this.currentQuestionIndex = 0;
    this.round = 1; 
    this.players = [];
    console.log("new game created " + roomId );
    
  }

  start() {

    this.round = 1;
    this.players = [];
    this.currentQuestionIndex = 0;
    console.log("Spiel startet");
    getNextQuestion().then(question => {
      console.log(question);
      this.sendQuestion(question);
      this.currentQuestionIndex = question.id;
    }).catch(error => {
      console.log('Fehler beim Abrufen der Frage:', error);
    });
    //this.sendQuestion();
  }

  sendQuestion(question) {
    
    if (question) {
      this.io.to(this.roomId).emit('question', question);
    } else {
      console.log('Fehler beim Abrufen der Fragen');
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


module.exports = QuizGame;
