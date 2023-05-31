const qs = require("../repositories/questions");

class QuizGame { 
  
  constructor(roomId, io) {
    this.MAX_ROUNDS = 5;
    this.io = io;
    this.roomId = roomId;
    this.questions = []; 
    this.currentQuestionIndex = 0;
    this.round = 1; 
    this.players = [];
    console.log("new game created " + roomId );
    
  }

  start(players) {

    this.round = 1;
    this.players = players;
    this.currentQuestionIndex = 0;
    console.log("Spiel startet");
    
    getNextQuestion().then(question => {
      console.log("Runde :" + this.round + " " + question);
      this.sendQuestion(question);
      this.questions[this.round] = question.id;
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

  answerQuestion(username, answer) {
  
    console.log("Room: " + this.roomId +" | User: " + username + " hat gewählt: " + answer );
    this.round++;
    if(this.round < 6){
      this.newQuestion();
    }else{
      console.log("Spiel zuende");
    }
    
  }

  endGame() {
    this.players.forEach((player) => {
      this.io.to(player.id).emit('gameEnd', { score: player.score });
    });
  }
  newQuestion(){
    getNextQuestion().then(question => {
      console.log("Runde :" + this.round + " " + question);
      
      if(checkDuplicateQuestion(question.id)){
        this.questions[this.round] = question.id;
        this.currentQuestionIndex = question.id;
        this.sendQuestion(question);
      }
      else{
        this.newQuestion();
       }    
    }).catch(error => {
      console.log('Fehler beim Abrufen der Frage:', error);
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


function checkDuplicateQuestion(quesID){

  for(let i = 1; i <= this.MAX_ROUNDS; i++ ){

    if(questions[i] === quesID){
      return false; 
    }

  }
  return true;

}


module.exports = QuizGame;
