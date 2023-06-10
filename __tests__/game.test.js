/** The test repository for game. */
const QuizGame = require("../game/QuizGame");

/**
 * This is the test section for addPlayer.
 */
describe("addPlayer", () => {

  beforeEach(() => {
    /** Creating a new instance before every test. */
    this.quizGame = new QuizGame('room1', null);
  });

  test("Add one player", async() => {
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

    /** Adding players. */
    this.quizGame.addPlayer(username);
    /** Trying to add the same username. */
    this.quizGame.addPlayer(username);
    /** Checks if the number of ther players remains as the same. */
    expect(this.quizGame.players.length).toBe(1);
  });

  /**
   * Checks if an error is reported while trying to add
   * a player with an existing username.
   */
  test('Add multiple players', async() => {
    const players = ['player1', 'player2', 'player3'];

    players.forEach((username) => {
      this.quizGame.addPlayer(username);
    });
    /** Checks if the number of players matches with the added players. */
    expect(this.quizGame.players.length).toBe(players.length);
    players.forEach((username, index) => {
      /** Checks if each added player has the corresponding username. */
      expect(this.quizGame.players[index].username).toBe(username);
      /** Checks if each added player has the score 0. */
      expect(this.quizGame.players[index].score).toBe(0);
    });
  });


});


/**
 * This is the test section for sendQuestion.
 */
describe("sendQuestion", () => {
  /** Instance of QuizGame. */
  let game;
  /** Mock object simulating the behavior of io objects. */
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
  test("Question is provided", async() => {
    const question = { text: "What is the capital of France?", options: ["Paris", "Berlin", "London"], correctAnswer: 0 };
    game.sendQuestion(question);
    expect(ioMock.to).toHaveBeenCalledWith("room1");
    expect(ioMock.emit).toHaveBeenCalledWith("question", question, game.round);
  });

  /**
   * Checks if the function logs an error when a question is not provided.
   */
  test("Error Question is not provided", async() => {
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
  /** Instance of QuizGame. */
  let game;
  /** Mock object simulating the behavior of io objects. */
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
  test("Correct answer increases player score", async() => {
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
  test("Wrong answer decreases player score", async() => {
    // Arrange
    const username = "user1";
    const answer = "B";
    game.currentRightAnswer = "A";

    /** Array of player objects with intial scores og 0 for two players. */
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
  test("Updates score board", async() => {
    const username = "user1";
    const answer = "A";
    game.currentRightAnswer = "A";
    /** Array of player objects with initial scores of 0 for one player. */
    game.players = [{ username: "user1", score: 0 }];
    game.answerQuestion(username, answer);
    expect(game.players[0].score).toBe(1);
  });

  /**
   * Checks if the game advances to the next round if all rounds are not completed
   */
  test("Advances to the next round", async() => {
    const username = "user1";
    const answer = "A";
    game.currentRightAnswer = "A";
    /** Array of player objects with intial scores og 0 for one player.*/
    game.players = [{ username: "user1", score: 0 }];
    game.round = 3;
    game.answerQuestion(username, answer);
    expect(game.round).toBe(4);
    expect(game.countAnswers).toBe(0);
  });

  /**
   * Checks if the game ends when all rounds are completed
   */
  test("Ends the game", async() => {
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
  /** Instance of QuizGame. */
  let game;
  /** Mock object simulating the behavior of io objects. */
  let ioMock;
  /** Mock object for the functionality of the database. */
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

/**
 * This is the test section for checkDuplicateQuestion.
 */
describe("checkDuplicateQuestion", () => {
  /** Define sample questions and max rounds. */
  const questions = {
    1: "123",
    2: "456",
    3: "789",
  };

  const maxRounds = 5;

  /**
   * Checks if the function returns true for a non-duplicate question ID.
   */
  test("True non-duplicate question ID", async() => {
    const quizGame = new QuizGame("room1", null);
    quizGame.MAX_ROUNDS = maxRounds;
    quizGame.questions = questions;
    const questionID = "999";
    const result = quizGame.checkDuplicateQuestion(questionID);
    expect(result).toBe(true);
  });

  /**
   * Checks if the function returns false for a duplicate question ID.
   */
  test("False duplicate question ID", async() => {
    const quizGame = new QuizGame("room1", null);
    quizGame.questions = questions;
    const questionID = "456";
    const result = quizGame.checkDuplicateQuestion(questionID);
    expect(result).toBe(false);
  });

  /**
   * Checks if the function returns true for an empty question list.
   */
  test("True empty question list", async() => {
    const quizGame = new QuizGame("room1", null);
    quizGame.MAX_ROUNDS = 0;
    quizGame.questions = {};
    const questionID = "123";
    const result = quizGame.checkDuplicateQuestion(questionID);
    expect(result).toBe(true);
  });

  /**
   * Checks if the function returns false for a question ID with the value of null.
   */
  test("false question ID is null", async() => {
    const quizGame = new QuizGame("room1", null);

    quizGame.MAX_ROUNDS = maxRounds;
    quizGame.questions = questions;

    const questionID = null;
    const result = quizGame.checkDuplicateQuestion(questionID);
    expect(result).toBe(false);
  });

  /**
   * Checks if the function returns true for a question list with the value of null.
   */
  test("true question list is null", async() => {
    const quizGame = new QuizGame("room1", null);

    quizGame.MAX_ROUNDS = maxRounds;
    quizGame.questions;

    const questionID = "123";
    const result = quizGame.checkDuplicateQuestion(questionID);
    expect(result).toBe(true);
  });

  /**
   * Checks if the function returns false for a question ID with the value of null
   * and a question list with the value of null.
   */
  test("false question ID and question list null", async() => {
    const quizGame = new QuizGame("room1", null);

    quizGame.MAX_ROUNDS = maxRounds;
    quizGame.questions = null;

    const questionID = null;
    const result = quizGame.checkDuplicateQuestion(questionID);
    expect(result).toBe(false);
  });
});

/**
 * This is the test section for userDisconnect.
 */
describe("userDisconnect", () => {
  let quizGame;

  beforeEach(() => {
    /**
     * Creates a new QuizGame instance before each test case.
     *
     * @type {QuizGame}
     */
    quizGame = new QuizGame("room1", null);
    quizGame.players = [
      { username: "player1" },
      { username: "player2" },
      { username: "player3" },
    ];
  });

  /**
   * Checks if the disconnected user is removed from the players array.
   */
  test("Removes disconnected user ", () => {
    const username = "player2";
    quizGame.userDisconnect(username);
    expect(quizGame.players.length).toBe(2);
    expect(quizGame.players.some((player) => player.username === username)).toBe(
      false
    );
  });

  /**
   * Checks if the message 'username has left the game!' is logged.
   */
  test("Logs 'username hat das Spiel verlassen!'", () => {
    const username = "player3";
    const consoleSpy = jest.spyOn(console, "log");
    quizGame.userDisconnect(username);
    /** The console.log method was called with the expected message. */
    expect(consoleSpy).toHaveBeenCalledWith(username + " hat das Spiel verlassen!");
    consoleSpy.mockRestore();
  });

  /**
   * Checks if endGame is called when there are less than 2 players remaining.
   */
  test("endGame() when less than 2 players", () => {
    const username = "player1";
    const endGameSpy = jest.spyOn(quizGame, "endGame");
    quizGame.userDisconnect(username);
    /** Verifies that the endGame method was called. */
    expect(endGameSpy).toHaveBeenCalled();
    endGameSpy.mockRestore();
  });

  /**
   * Checks if endGame is not called when there are 2 or more players remaining.
   */
  test("endGame() not called when 2 or more players", () => {
    const username = "player2";
    const endGameSpy = jest.spyOn(quizGame, "endGame");
    quizGame.userDisconnect(username);
    /** Verifies that the endGame method was not called. */
    expect(endGameSpy).not.toHaveBeenCalled();
    endGameSpy.mockRestore();
  });

  /**
   * Checks if no player is removed when the disconnected user does not exist in the players array.
   */
  test("Not removing player if user does not exist", () => {
    /** Does not remove any player when the disconnected user does not exist. */
    const username = "nonexistentPlayer";
    quizGame.userDisconnect(username);
    expect(quizGame.players.length).toBe(3);
  });

  /**
   * Checks if 'userLeftGame' event is not emitted when there are 2 or more players remaining.

  test("Not emitting 'userLeftGame' when 2 or more players", () => {
    const username = "player3";
    const emitSpy = jest.spyOn(quizGame.io, "to").mockReturnThis();
    const emitEventSpy = jest.spyOn(quizGame.io, "emit");
    quizGame.userDisconnect(username);
    expect(emitEventSpy).not.toHaveBeenCalledWith("userLeftGame", false);
    emitSpy.mockRestore();
    emitEventSpy.mockRestore();
  });
   */
});


/**
 * This is the test section for updateScoreBoard.
 */
describe("updateScoreBoard", () => {
  let quizGame;
  let emitMock;

  beforeEach(() => {
    // Create a new QuizGame instance before each test case
    quizGame = new QuizGame("room1", null);
    quizGame.players = [
      { username: "player1", score: 10 },
      { username: "player2", score: 15 },
      { username: "player3", score: 8 },
    ];

    // Mock the emit function
    emitMock = jest.fn();
    quizGame.io = {
      to: jest.fn().mockReturnThis(),
      emit: emitMock,
    };
  });

  /**
   * Checks if the updated scores are sent correctly.
   */
  test("sends updated scores to players", () => {
    quizGame.updateScoreBoard();
    expect(emitMock).toHaveBeenCalledWith("scoreBoard", quizGame.players);
  });

  /**
   * Checks if the correct room is targeted.
   */
  test("scoreboard of the correct room", () => {
    quizGame.updateScoreBoard();
    expect(quizGame.io.to).toHaveBeenCalledWith(quizGame.roomId);
  });

  /**
   * Checks if the 'scoreBoard' event is emitted with an empty players array when there are no players.
   */
  test("empty players array when there are no players", () => {
    quizGame.players = [];
    quizGame.updateScoreBoard();
    expect(emitMock).toHaveBeenCalledWith("scoreBoard", []);
  });
});
