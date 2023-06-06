const qs = require("../repositories/questions");
const database = require("../repositories");
const db = database.getConnection();
const maxRounds = 5;
class QuizGame {

  /**
   * Constructs a new instance of the QuizGame class.
   *
   * @param {string} roomId - The ID of the game room.
   * @param {object} io - The IO object for communication.
   */
  constructor(roomId, io) {
    this.MAX_ROUNDS = 5;
    this.io = io;
    this.roomId = roomId;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.currentRightAnswer = "";
    this.round = 1;
    this.players = [];
    this.winner =[];
    this.countAnswers = 0;
    console.log("new game created " + roomId);

    db.then(conn => {
      conn.query("INSERT INTO ACTIVE_GAME (ROOM_ID) VALUES (?)", [roomId])
      .then(rows => {
        console.log(rows);
      })
      .catch(error => {
        console.log(error);
      })
    })

  }

  /**
   * Starts the quiz game by initializing game properties,
   * updating the score board, and sending the first question.
   */
  start() {

    this.round = 1;
    //this.players = players;
    this.currentQuestionIndex = 0;
    console.log("Spiel startet");
    this.updateScoreBoard();

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

  /**
   * Adds a new player to the game with the specified username.
   * Checks for duplicate usernames before adding the player.
   *
   * @param username - The username of the player to add.
   */
  addPlayer(username) {
    
    console.log("übergebener username: " + username);

      if(this.userExist(username)){
        console.log("Fehler, doppelter User");

      }else{

        const player = {
          username: username,
          score: 0,
        };

        this.players.push(player);
        console.log("Neuer Spieler hinzugefügt: " + player.username);
      }
    
  }

  /**
   * Sends a question to the players in the game room.
   *
   * @param question - The question object to send.
   */
  sendQuestion(question) {

    if (question) {
      this.io.to(this.roomId).emit('question', question, this.round);
    } else {
      console.log('Fehler beim Abrufen der Fragen');
    }
  }

  /**
   * Processes a player's answer to a question in the game.
   * Updates player scores based on the correctness of the answer,
   * updates the score board, starts a new round or ends the game.
   *
   * @param username - The username of the player answering the question.
   * @param answer - The answer provided by the player.
   */
  answerQuestion(username, answer) {

    //doppelte antort auf eine frage verhindern
    if(this.countAnswers === 1){
      console.log("Doppelte Antwort " + username);
    }else{
    this.countAnswers++;
    console.log("Room: " + this.roomId + " | User: " + username + " hat gewählt: " + answer);
    console.log(this.currentRightAnswer + " Richtige Antwort ");
    if (this.currentRightAnswer === String(answer)) {
      console.log("antwort richtig");
      this.players.forEach((player) => {
        if (player.username === username) {
          player.score++;
          console.log("Right Answer " + "Score of " + player.username + " incremented! " + player.score);
        }
      });
    } else {
      this.players.forEach((player) => {
        if (player.username !== username) {
          player.score++;
          console.log("Wrong Answer " + "Score of " + player.username + " incremented! " + player.score);
        }
      });
    }
    this.updateScoreBoard();
    this.round++;
    console.log("Aktueller Stand: "+ this.players);
    
    if (this.round <= maxRounds) {
    
      this.io.to(this.roomId).emit('newRoundCountdown');
      setTimeout(() => {
        this.newQuestion();
      }, 5000);
      this.countAnswers = 0;

    } else {
      console.log("Spiel zuende");
      this.endGame();
    }
  }

  }

  /**
   * Ends the game and performs necessary actions such as updating player high scores in the database
   * and emitting the 'gameEnd' event to the game room.
   */
  endGame() {

    const null_player = {
      username: "",
      score: -1
    }
    this.winner.push(null_player);
    
    this.players.forEach((player) => {

      if (this.winner[0].score <= player.score) {
        this.winner.shift();
        this.winner.push(player);
      }

    })
    
    this.players.forEach((player) => {
      db.then(conn => {
        conn.query("SELECT HIGHSCORE FROM USER WHERE USERNAME = ?", [player.username])
          .then(rows => {
            try {
              const highscore = rows[0].HIGHSCORE;
              if(player.score === 5){
                highscore+= 15;
              }
              const newhighscore = highscore+ player.score;
              console.log(player.username + "Alter Highscore:" + highscore);
              console.log(player.username + "Neuer Highscore:" + newhighscore);
             
              conn.query("UPDATE USER SET HIGHSCORE = ? WHERE USERNAME = ?", [newhighscore, player.username])
                .then(rows => {
                  console.log(rows);
                })
            } catch (error) {
              console.log(error);
            }
          })
        if(player.score === 5){

          conn.query("UPDATE USER SET PERFECT_WINS = PERFECT_WINS + 1 WHERE USERNAME = ?", [player.username])
          .then(rows => {
            console.log(rows);
          })
        }
        if (this.winner[0].username === player.username ){
          conn.query("UPDATE USER SET WINS = WINS + 1 WHERE USERNAME = ?", [player.username])
          .then(rows => {
            console.log(rows);
          })
          conn.query("UPDATE USER SET CONCURRENT_WINS = CONCURRENT_WINS + 1 WHERE USERNAME = ?", [player.username])
          .then(rows => {
          console.log(rows);
          })

        }else{
          conn.query("UPDATE USER SET LOSES = LOSES + 1 WHERE USERNAME = ?", [player.username])
          .then(rows => {
            console.log(rows);
          })
          conn.query("UPDATE USER SET CONCURRENT_WINS = 0 WHERE USERNAME = ?", [player.username])
          .then(rows => {
          console.log(rows);
        })
        }
      })
    });

    this.io.to(this.roomId).emit('gameEnd', this.players);

    db.then(conn => {
      conn.query("DELETE FROM ACTIVE_GAME WHERE ROOM_ID = ?", [this.roomId])
      .catch(error => {
        console.log(error);
      })
    })
  }

  /**
   * This function fetches the next question, checks for duplicate questions, and sends the question to the players.
   */
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

  /**
   * Returns a string representation of the players in the game along with their scores.
   *
   * @return {string} - The string representation of the players and their scores.
   */
  toString() {
    const playerStrings = this.players.map(player => `${player.username} (Score: ${player.score})`);
    return playerStrings.join(", ");
  }

  /**
   * Updates the score board by emitting the "scoreBoard" event to the game room.
   * The event includes the current players and their scores.
   */
  updateScoreBoard(){
    this.io.to(this.roomId).emit("scoreBoard", this.players);
  }

  /**
   * Checks if a user with the given username already exists in the game.
   *
   * @param username - The username to check for existence in the game.
   * @return {boolean} - True if the user exists, false otherwise.
   */
  userExist(username){

    let userExists = false; 

    this.players.forEach(player => {
    if (player.username === username) {
      console.log("Der Benutzername existiert bereits! Wird nicht dem Spiel hinzugefügt");
      userExists = true;
    }
  });

    return userExists;

  }
}

/**
 * It generates a random question ID and fetches the corresponding question row.
 * Retrieves the next question asynchronously from the database.
 *
 * @return {Promise<*|null>} - A Promise that resolves to the next question object or null if no question is retrieved.
 */
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
      return shuffleAnswers(question);
    }
  } catch (error) {
    console.log('Fehler beim Abrufen der nächsten Frage:', error);
  }

  return null; // Falls keine Frage abgerufen werden kann, wird null zurückgegeben
}

/**
 * Checks if a question with the given question ID already exists in the game's questions array.
 * It iterates through the questions array and compares each element with the given question ID.
 *
 * @param quesID - The question ID to check for duplication.
 * @return {boolean} - A boolean value indicating whether the question is a duplicate (false) or not (true).
 */
function checkDuplicateQuestion(quesID) {

  for (let i = 1; i <= this.MAX_ROUNDS; i++) {

    if (questions[i] === quesID) {
      return false;
    }

  }
  return true;
}

/**
 * Shuffles the answer options of a question in random order.
 *
 * @param question - The question object containing the answer options to shuffle.
 * @return {*} - The question object with shuffled answer options.
 */
function shuffleAnswers(question) {
  const answers = question.answers;
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return question;
}


module.exports = QuizGame;
