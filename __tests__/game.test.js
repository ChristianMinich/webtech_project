/** The test repository for game. */

const QuizGame = require("../game/QuizGame");
const { addPlayer } = require("../game/QuizGame");

/**
 * This is the test section for addPlayer.
 */
describe("addPlayer", () => {

  beforeEach(() => {
    /*** Creating a new instance before every test. */
    this.quizGame = new QuizGame('room1', null);
  });

  test("Add one player", () => {
    const quizGame = new QuizGame("room1", null);
    const username = "player1";

    quizGame.addPlayer(username);

    expect(quizGame.players.length).toBe(1);
    expect(quizGame.players[0].username).toBe(username);
    expect(quizGame.players[0].score).toBe(0);
  });

  /**
   * Checks if an error is reported while trying to add
   * a player with an existing username.
   */
  test('Add player with existing username', () => {
    const username = 'player1';

    /*** Adding players. */
    this.quizGame.addPlayer(username);
    /*** Trying to add the same username. */
    this.quizGame.addPlayer(username);
    /*** Checks if the number of ther players remains as the same. */
    expect(this.quizGame.players.length).toBe(1);
  });

  /**
   * Checks if an error is reported while trying to add
   * a player with an existing username.
   */
  test('Add multiple players', () => {
    const players = ['player1', 'player2', 'player3'];

    players.forEach((username) => {
      this.quizGame.addPlayer(username);
    });
    /*** Checks if the number of players matches with the added players. */
    expect(this.quizGame.players.length).toBe(players.length);
    players.forEach((username, index) => {
      /*** Checks if each added player has the corresponding username. */
      expect(this.quizGame.players[index].username).toBe(username);
      /*** Checks if each added player has the score 0. */
      expect(this.quizGame.players[index].score).toBe(0);
    });
  });


});


/**
 * This is the test section for sendQuestion.
 */
describe("sendQuestion", () => {
  /*** Instance of QuizGame. */
  let game;
  /*** Mock object simulating the behavior of io objects. */
  let ioMock;

  /**
   * Creating Mocks.
   */
  beforeEach(() => {
    ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    game = new QuizGame("room1", ioMock);
  });

  /**
   * Sets all mock functions.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Checks if the sendQuestion function sends the question to the room
   * when a question is provided.
   */
  test("Question is provided", () => {
    const question = { text: "What is the capital of France?", options: ["Paris", "Berlin", "London"], correctAnswer: 0 };
    game.sendQuestion(question);
    expect(ioMock.to).toHaveBeenCalledWith("room1");
    expect(ioMock.emit).toHaveBeenCalledWith("question", question, game.round);
  });

  /**
   * Checks if the function logs an error when a question is not provided.
   */
  test("Error Question is not provided", () => {
    const consoleSpy = jest.spyOn(console, "log");
    game.sendQuestion(null);
    expect(ioMock.to).not.toHaveBeenCalled();
    expect(ioMock.emit).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Fehler beim Abrufen der Fragen");
    consoleSpy.mockRestore(); // Wiederherstellung des ursprünglichen console.log
  });

});


/**
 * This is the test section for answerQuestion.
 */
describe("answerQuestion", () => {
  /*** Instance of QuizGame. */
  let game;
  /*** Mock object simulating the behavior of io objects. */
  let ioMock;

  /**
   * Creating Mocks.
   */
  beforeEach(() => {
    ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    game = new QuizGame("room1", ioMock);
  });

  /**
   * Sets all mock functions.
   */
  afterEach(() => {
    // Bereinigungen nach jedem Testfall
    jest.clearAllMocks(); // Zurücksetzen aller Mocks
  });

  /**
   * Checks if the player's score is increased when the answer is correct.
   */
  test("Correct answer increases player score", () => {
    // Arrange
    const username = "user1";
    const answer = "A";
    game.currentRightAnswer = "A";
    game.players = [{ username: "user1", score: 0 }];

    // Act
    game.answerQuestion(username, answer);

    // Assert
    expect(game.players[0].score).toBe(1);
  });

  /**
   * Checks if the scores of other players are increased when the answer is wrong.
   */
  test("Wrong answer decreases player score", () => {
    // Arrange
    const username = "user1";
    const answer = "B";
    game.currentRightAnswer = "A";

    /*** Array of player objects with intial scores og 0 for two players. */
    game.players = [
      { username: "user1", score: 0 },
      { username: "user2", score: 0 },
    ];

    game.answerQuestion(username, answer);
    expect(game.players[0].score).toBe(0);
    expect(game.players[1].score).toBe(1);
  });

  /**
   * Checks if the score board is updated after answering a question.
   */
  test("Updates score board", () => {
    const username = "user1";
    const answer = "A";
    game.currentRightAnswer = "A";
    /*** Array of player objects with initial scores of 0 for one player. */
    game.players = [{ username: "user1", score: 0 }];
    game.answerQuestion(username, answer);
    expect(game.players[0].score).toBe(1);
  });

  /**
   * Checks if the game advances to the next round if all rounds are not completed
   */
  test("Advances to the next round", () => {
    const username = "user1";
    const answer = "A";
    game.currentRightAnswer = "A";
    /*** Array of player objects with intial scores og 0 for one player.*/
    game.players = [{ username: "user1", score: 0 }];
    game.round = 3;
    game.answerQuestion(username, answer);
    expect(game.round).toBe(4);
    expect(game.countAnswers).toBe(0);
  });

  /**
   * Checks if the game ends when all rounds are completed
   */
  test("Ends the game", () => {
    const username = "user1";
    const answer = "A";
    game.currentRightAnswer = "A";
    game.players = [{ username: "user1", score: 0 }];
    game.round = 5;
    game.answerQuestion(username, answer);
    expect(game.round).toBe(6);
    expect(game.countAnswers).toBe(1);
  });
});


/**
 * This is the test section for endGame.
 */
describe("endGame", () => {
  /*** Instance of QuizGame. */
  let game;
  /*** Mock object simulating the behavior of io objects. */
  let ioMock;
  /*** Mock object for the functionality of the database. */
  let dbMock;

  /**
   * Creating Mocks for the io objects and database.
   */
  beforeEach(() => {
    ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    dbMock = {
      query: jest.fn(),
    };
    game = new QuizGame("room1", ioMock);
    game.db = dbMock;
  });

  /**
   * Sets all mock functions.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Checks if the palyer highscore gets updated in the database
   * after the game ends
   */
  test("Updates player highscore in db", async () => {
    const player = { username: "user1", score: 10 };
    game.players = [player];
    dbMock.query.mockResolvedValueOnce([{ HIGHSCORE: 5 }]);
    await game.endGame();
    expect(dbMock.query).toHaveBeenCalledTimes(0);
  });

  /**
   * Checks if the "gameEnd" event is emitted to the game room.
   */
  test("Emits 'gameEnd' event to the room", async () => {
    const player = { username: "user1", score: 10 };
    game.players = [player];
    await game.endGame();
    expect(ioMock.to).toHaveBeenCalledWith(game.roomId);
    expect(ioMock.emit).toHaveBeenCalledWith("gameEnd", game.players);
  });
});
