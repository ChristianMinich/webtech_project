const qs = require("../repositories/questions");
const database = require("../repositories");
const db = database.getConnection();
class QuizGame {

  constructor(roomId, io) {
    this.MAX_ROUNDS = 5;
    this.io = io;
    this.roomId = roomId;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.currentRightAnswer = "";
    this.round = 1;
    this.players = [];
    console.log("new game created " + roomId);

  }
  start() {

    this.round = 1;
    //this.players = players;
    this.currentQuestionIndex = 0;
    console.log("Spiel startet");

    getNextQuestion().then(question => {
      console.log("Runde :" + this.round + " " + question.text);
      this.sendQuestion(question, this.round);
      this.questions[this.round] = question.id;
      this.currentRightAnswer = question.right_answer;
      this.currentQuestionIndex = question.id;
    }).catch(error => {
      console.log('Fehler beim Abrufen der Frage:', error);
    });
    //this.sendQuestion();
  }
  addPlayer(username) {
    console.log("übergebener username: " + username);
    const player = {
      username: username,
      score: 0
    };
    console.log(player);
    this.players.push(player);
    console.log("Neuer log " + String(this.players[this.players.length - 1].username));
  }
  sendQuestion(question) {

    if (question) {
      this.io.to(this.roomId).emit('question', question, this.round);
    } else {
      console.log('Fehler beim Abrufen der Fragen');
    }
  }

  answerQuestion(username, answer) {

    console.log("Room: " + this.roomId + " | User: " + username + " hat gewählt: " + answer);
    console.log(this.currentRightAnswer + " Richtige Antwort ");
    console.log(this.players);
    if (this.currentRightAnswer === String(answer)) {
      console.log("antwort richtig");
      this.players.forEach((player) => {
        console.log("player.username " + player.username);
        console.log("player.score" + player.score);
        if (player.username === username) {
          player.score++;
          console.log("Right Answer " + "Score of " + player.username + "incremented!" + player.score);
        }
      });
    } else {
      this.players.forEach((player) => {
        console.log("player.username " + player.username);
        console.log("player.score" + player.score);
        if (player.username !== username) {
          player.score++;
          console.log("Wrong Answer " + "Score of " + player.username + "incremented!" + player.score);
        }
      });
    }

    this.round++;
    if (this.round < 6) {
      this.newQuestion();
    } else {
      console.log("Spiel zuende");
      this.endGame();
    }

  }

  endGame() {
    /*
    this.players.forEach((player) => {
      this.io.to(player.id).emit('gameEnd', { score: player.score });
    });*/

    this.players.forEach((player) => {
      db.then(conn => {
        conn.query("SELECT HIGHSCORE FROM USER WHERE USERNAME = ?", [player.username])
          .then(rows => {
            try {
              const highscore = rows[0].HIGHSCORE;
              console.log("Highscore:" + highscore);
              if (player.score > highscore) {
                conn.query("UPDATE USER SET HIGHSCORE = ? WHERE USERNAME = ?", [player.score, player.username])
                  .then(rows => {
                    console.log(rows);
                  })
              }

            } catch (error) {
              console.log(error);
            }
          })
      })
    });


  }
  newQuestion() {
    getNextQuestion().then(question => {
      console.log("Runde :" + this.round + " " + String(question.text));

      if (checkDuplicateQuestion(question.id)) {
        this.questions[this.round] = question.id;
        this.currentQuestionIndex = question.id;
        this.currentRightAnswer = question.right_answer;
        this.sendQuestion(question);
      }
      else {
        this.newQuestion();
      }
    }).catch(error => {
      console.log('Fehler beim Abrufen der Frage:', error);
    });
  }
  toString() {
    const playerStrings = this.players.map(player => `${player.username} (Score: ${player.score})`);
    return playerStrings.join(", ");
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
        right_answer: questionRow.RIGHT_ANSWER,
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


function checkDuplicateQuestion(quesID) {

  for (let i = 1; i <= this.MAX_ROUNDS; i++) {

    if (questions[i] === quesID) {
      return false;
    }

  }
  return true;

}


module.exports = QuizGame;
