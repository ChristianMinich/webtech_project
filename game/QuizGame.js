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
    /** Maximum number of rounds in the game. */
    this.MAX_ROUNDS = 5;
    /** Socket.io instance. */
    this.io = io;
    /** ID of the game room. */
    this.roomId = roomId;
    /** Array to store the question for the game. */
    this.questions = [];
    /** Index of the current question being asked. */
    this.currentQuestionIndex = 0;
    /** Correct answer for the current answer. */
    this.currentRightAnswer = "";
    /** Current round number. */
    this.round = 1;
    /** Array to store the players in the game. */
    this.players = [];
    /** Array to store the winner of the game. */
    this.winner = [];
    /** Counter to track the number of answers submitted for a question. */
    this.countAnswers = 0;
    //** To check if a game ist still active */
    this.gameRunning = true;

    /** Logging the creation of a new game instance. */
    // console.log("new game created " + roomId);
  }

  /**
   * Starts the quiz game by initializing game properties,
   * updating the score board, and sending the first question.
   */
  start() {
    this.round = 1;
    this.currentQuestionIndex = 0;
    this.updateScoreBoard();
    /** Initiate a new round countdown and start the first question. */
    this.io.to(this.roomId).emit("newRoundCountdown");
    setTimeout(() => {
      this.newQuestion();
    }, 5000);
  }

  /**
   * Adds a new player to the game with the specified username.
   * Checks for duplicate usernames before adding the player.
   *
   * @param username - The username of the player to add.
   */
  addPlayer(username) {
    console.log("übergebener username: " + username);

    if (username == null || username === "") {
      console.log("Fehler, ungültiger Benutzername");
    } else if (this.userExist(username)) {
      console.log("Fehler, doppelter User");
    } else {
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
      this.io.to(this.roomId).emit("question", question, this.round);
    } else {
      console.log("Fehler beim Abrufen der Fragen");
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
    /** Prevent duplicate answers to a question. */
    if (this.countAnswers === 1) {
      console.log("Doppelte Antwort " + username);
    } else {
      this.countAnswers++;
      console.log(
        "Room: " +
          this.roomId +
          " | User: " +
          username +
          " hat gewählt: " +
          answer
      );
      console.log(this.currentRightAnswer + " Richtige Antwort ");

      /** Check if the answer is correct and update scores accordingly. */
      if (this.currentRightAnswer === String(answer)) {
        console.log("antwort richtig");
        this.players.forEach((player) => {
          if (player.username === username) {
            player.score++;
            console.log(
              "Right Answer " +
                "Score of " +
                player.username +
                " incremented! " +
                player.score
            );
          }
        });
      } else {
        this.players.forEach((player) => {
          if (player.username !== username) {
            player.score++;
            console.log(
              "Wrong Answer " +
                "Score of " +
                player.username +
                " incremented! " +
                player.score
            );
          }
        });
      }
      /** Update the scoreboard and check if the game should continue or end. */
      this.updateScoreBoard();
      this.round++;
      console.log("Aktueller Stand: " + this.players);

      if (this.round <= maxRounds) {
        /** Start a new round with a countdown and a new question. */
        if (this.gameRunning) {
          this.io.to(this.roomId).emit("newRoundCountdown");
          setTimeout(() => {
            this.newQuestion();
          }, 5000);
          this.countAnswers = 0;
        }
      } else {
        /** End the game if the maximum number of rounds is reached. */
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
    this.gameRunning = false;
    /** Define a null player object with default values. */
    const null_player = {
      username: "",
      score: -1,
    };
    this.winner.push(null_player);

    /** Determine the winner based on the highest score. */
    this.players.forEach((player) => {
      if (this.winner[0].score <= player.score) {
        this.winner.shift();
        this.winner.push(player);
      }
    });

    /** Update player statistics and highscores in the database. */
    this.players.forEach((player) => {
      db.then((conn) => {
        conn
          .query("SELECT HIGHSCORE FROM USER WHERE USERNAME = ?", [
            player.username,
          ])
          .then((rows) => {
            try {
              var highscore = rows[0].HIGHSCORE;
              if (player.score === 5) {
                highscore += 15;
              }
              const newhighscore = highscore + player.score;
              console.log(player.username + "Alter Highscore:" + highscore);
              console.log(player.username + "Neuer Highscore:" + newhighscore);

              /** Update player highscore in the database. */
              conn
                .query("UPDATE USER SET HIGHSCORE = ? WHERE USERNAME = ?", [
                  newhighscore,
                  player.username,
                ])
                .then((rows) => {
                  console.log(rows);
                });
            } catch (error) {
              console.log(error);
            }
          });
        /** Update the player's perfect wins count in the database. */
        if (player.score === 5) {
          conn
            .query(
              "UPDATE USER SET PERFECT_WINS = PERFECT_WINS + 1 WHERE USERNAME = ?",
              [player.username]
            )
            .then((rows) => {
              console.log(rows);
            });
        }
        if (this.winner[0].username === player.username) {
          /** Update the player's wins and concurrent wins count in the database. */

          /** Player earned first Win Achievement */
          conn
            .query("SELECT USER_ID, WINS FROM USER WHERE USERNAME = ?", [
              player.username,
            ])
            .then((rows) => {
              try {
                const winCount = rows[0].WINS;
                const currUserID = rows[0].USER_ID;

                if (winCount === 0) {
                  conn
                    .query(
                      "INSERT INTO USER_ACHIEVEMENT (USER_ID, ACHIEVEMENT_ID) VALUES (?, ?)",
                      [currUserID, 2]
                    )
                    .then((rows) => {
                      console.log(rows);
                    })
                    .catch((error) => {
                      console.log(error);
                    });

                  /** Player earned first Win Achievement (ACHIEVEMENT_GAINED) */
                  conn
                    .query(
                      "INSERT INTO ACHIEVEMENT_GAINED (USERNAME, ACHIEVEMENT_ID) VALUES (?, ?)",
                      [player.username, 2]
                    )
                    .then((rows) => {
                      console.log(rows);
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                }
              } catch (error) {
                console.log(error);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          /** Player earned Perfect Win */
          if (player.score === 5) {
            conn
              .query("SELECT USER_ID, WINS FROM USER WHERE USERNAME = ?", [
                player.username,
              ])
              .then((rows) => {
                if (rows.length !== 0) {
                  try {
                    const currUserID = rows[0].USER_ID;
                    conn
                      .query(
                        "INSERT INTO USER_ACHIEVEMENT (USER_ID, ACHIEVEMENT_ID) VALUES (?, ?)",
                        [currUserID, 4]
                      )
                      .then((rows) => {
                        console.log(rows);
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                    conn
                      .query(
                        "INSERT INTO ACHIEVEMENT_GAINED (USERNAME, ACHIEVEMENT_ID) VALUES (?, ?)",
                        [player.username, 4]
                      )
                      .then((rows) => {
                        console.log(rows);
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  } catch (error) {
                    console.log(error);
                  }
                }
              });
          }

          /** Player earned Win */
          conn
            .query("UPDATE USER SET WINS = WINS + 1 WHERE USERNAME = ?", [
              player.username,
            ])
            .then((rows) => {
              console.log(rows);
            });
          conn
            .query(
              "UPDATE USER SET CONCURRENT_WINS = CONCURRENT_WINS + 1 WHERE USERNAME = ?",
              [player.username]
            )
            .then((rows) => {
              console.log(rows);
            });
        } else {
          /** First Loss Achievement */
          conn
            .query("SELECT USER_ID, LOSES FROM USER WHERE USERNAME = ?", [
              player.username,
            ])
            .then((rows) => {
              if (rows.length !== 0) {
                try {
                  const lossCount = rows[0].LOSES;
                  const currUserID = rows[0].USER_ID;
                  if (lossCount === 0) {
                    conn
                      .query(
                        "INSERT INTO USER_ACHIEVEMENT (USER_ID, ACHIEVEMENT_ID) VALUES (?, ?)",
                        [currUserID, 3]
                      )
                      .then((rows) => {
                        console.log(rows);
                      })
                      .catch((error) => {
                        console.log(error);
                      });

                    /** Player earned first Loss Achievement (ACHIEVEMENT_GAINED) */
                    conn
                      .query(
                        "INSERT INTO ACHIEVEMENT_GAINED (USERNAME, ACHIEVEMENT_ID) VALUES (?, ?)",
                        [player.username, 3]
                      )
                      .then((rows) => {
                        console.log(rows);
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                } catch (error) {
                  console.log(error);
                }
              }
            })
            .catch((error) => {
              console.log(error);
            });
          /** Update the player's loses count and reset concurrent wins count in the database. */
          conn
            .query("UPDATE USER SET LOSES = LOSES + 1 WHERE USERNAME = ?", [
              player.username,
            ])
            .then((rows) => {
              console.log(rows);
            });
          conn
            .query("UPDATE USER SET CONCURRENT_WINS = 0 WHERE USERNAME = ?", [
              player.username,
            ])
            .then((rows) => {
              console.log(rows);
            });
        }
      });
    });

    /** Emit the gameEnd event to all players in the room. */
    this.io.to(this.roomId).emit("gameEnd", this.players);

    /** Remove the active game record from the database. */
    db.then((conn) => {
      conn
        .query("DELETE FROM ACTIVE_GAME WHERE ROOM_ID = ?", [this.roomId])
        .catch((error) => {
          console.log(error);
        });
    });
  }
  userDisconnect(username) {

    this.players = this.players.filter(
      (player) => player.username !== username
    );
  
    if (this.players.length >= 2) {
      db.then((conn) => {
        conn
          .query("SELECT USER_ID FROM USER WHERE USERNAME = ?", [username])
          .then((rows) => {
            try {
              if (rows.length !== 0) {
                const currUserID = rows[0].USER_ID;

                conn
                  .query("SELECT * FROM USER_ACHIEVEMENT WHERE USER_ID = ?", [
                    currUserID,
                  ])
                  .then((rows) => {
                    if (rows.length === 0) {
                      conn
                        .query(
                          "INSERT INTO USER_ACHIEVEMENT (USER_ID, ACHIEVEMENT_ID) VALUES (?, ?)",
                          [currUserID, 1]
                        )
                        .then((rows) => {
                          console.log(rows);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                      conn
                        .query(
                          "INSERT INTO ACHIEVEMENT_GAINED (USERNAME, ACHIEVEMENT_ID) VALUES (?, ?)",
                          [username, 1]
                        )
                        .then((rows) => {
                          console.log(rows);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }
            } catch (error) {
              console.log(error);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }

    
    console.log(username + " hat das Spiel verlassen!");
    if (this.players.length < 2 && this.gameRunning) {
      this.gameRunning = false;
      this.endGame();
      this.io.to(this.roomId).emit("userLeftGame", this.gameRunning);
    }
  }

  /**
   * This function fetches the next question, checks for duplicate questions, and sends the question to the players.
   */
  newQuestion() {
    getNextQuestion()
      .then((question) => {
        if (this.checkDuplicateQuestion(question.id)) {
          this.questions[this.round] = question.id;
          this.currentQuestionIndex = question.id;
          this.currentRightAnswer = question.right_answer;
          question.right_answer = "netter Versuch ;)";
          console.log(
            "Runde :" +
              this.round +
              " " +
              String(question.text) +
              "| " +
              this.questions
          );
          this.sendQuestion(question);
        } else {
          console.log("Doppelte Frage: " + this.questions);
          this.newQuestion();
        }
      })
      .catch((error) => {
        console.log("Fehler beim Abrufen der Frage:", error);
      });
  }

  /**
   * Returns a string representation of the players in the game along with their scores.
   *
   * @return {string} - The string representation of the players and their scores.
   */
  toString() {
    const playerStrings = this.players.map(
      (player) => `${player.username} (Score: ${player.score})`
    );
    return playerStrings.join(", ");
  }

  /**
   * Updates the score board by emitting the "scoreBoard" event to the game room.
   * The event includes the current players and their scores.
   */
  updateScoreBoard() {
    this.io.to(this.roomId).emit("scoreBoard", this.players);
  }

  /**
   * Checks if a user with the given username already exists in the game.
   *
   * @param username - The username to check for existence in the game.
   * @return {boolean} - True if the user exists, false otherwise.
   */
  userExist(username) {
    let userExists = false;

    this.players.forEach((player) => {
      if (player.username === username) {
        console.log(
          "Der Benutzername existiert bereits! Wird nicht dem Spiel hinzugefügt"
        );
        userExists = true;
      }
    });

    return userExists;
  }

  /**
   * Checks if a question with the given question ID already exists in the game's questions array.
   * It iterates through the questions array and compares each element with the given question ID.
   *
   * @param quesID - The question ID to check for duplication.
   * @return {boolean} - A boolean value indicating whether the question is a duplicate (false) or not (true).
   */
  checkDuplicateQuestion(quesID) {
    if (quesID === null) {
      return false;
    }
    for (let i = 1; i <= this.MAX_ROUNDS; i++) {
      if (this.questions[i] === quesID) {
        return false;
      }
    }
    return true;
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
    const randomQuestionID = Math.floor(Math.random() * 27) + 1; // Beispiel: Zufällige Frage ID generieren
    const rows = await qs.getQuestions(randomQuestionID);

    if (rows.length > 0) {
      /** Get the first row of questions */
      const questionRow = rows[0]; 

      const question = {
        id: questionRow.QUESTION_ID,
        text: questionRow.QUESTION,
        right_answer: questionRow.RIGHT_ANSWER,
        answers: [
          questionRow.RIGHT_ANSWER,
          questionRow.FALSE_ANSWER1,
          questionRow.FALSE_ANSWER2,
          questionRow.FALSE_ANSWER3,
        ],
        category: questionRow.CATEGORY_ID,
      };
      return shuffleAnswers(question);
    }
  } catch (error) {
    console.log("Fehler beim Abrufen der nächsten Frage:", error);
  }

  return null;
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
