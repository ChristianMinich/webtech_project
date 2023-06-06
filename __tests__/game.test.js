/** The test repository for game */

const QuizGame = require("../game/QuizGame");
const { addPlayer } = require("../game/QuizGame");

/**
 * This is the test section for addPlayer
 */
describe("Add Player", () => {

  beforeEach(() => {
    /*** Creating a new instance before every test*/
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

    /*** Adding players*/
    this.quizGame.addPlayer(username);
    /*** Trying to add the same username*/
    this.quizGame.addPlayer(username);
    /*** Checks if the number of ther players remains as the same*/
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
    /*** Checks if the number of players matches with the added players*/
    expect(this.quizGame.players.length).toBe(players.length);
    players.forEach((username, index) => {
      /*** Checks if each added player has the corresponding username*/
      expect(this.quizGame.players[index].username).toBe(username);
      /*** Checks if each added player has the score 0*/
      expect(this.quizGame.players[index].score).toBe(0);
    });
  });


});

