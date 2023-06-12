# QuizDuell

QuizDuell is a Node.js web application built with Express that allows users to play an interactive quiz game.

## Features

- Multiple-choice questions with options
- Score tracking
- Leaderboard to display top scores
- User authentication and registration

## Installation

1. Clone the repository: `git clone https://github.com/ChristianMinich/webtech_project.git`
2. Navigate to the project directory: `cd webtech_project`
3. Install the dependencies: `npm install`

## Configuration

1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables to the `.env` file:

```
PORT=3000
DATABASE_URL=mariadb://localhost/quizduell
JWT_SECRET=Liefergruppe
```

Note: Adjust the values as per your requirements.

## Database Setup

1. Make sure you have MariaDB installed and running on your local machine or connect to the remote Database.
2. If run locally create a new database called `QUIZGAME` in Mariadb.

## Usage

1. Start the application: `node server.js`
2. Open your web browser and visit `http://localhost:3000` (or the port you specified in `.env`).

## JSDoc

1. Install Dependencies globally:

```
npm install -g jsdoc
```
```
npm install --save-dev jsdoc
```
2. Change Directory 
```
cd webtech_project
```
3. Generate JSDocs with directory path (./directory/)
```
jsdoc -r ./game/ ./services/ ./routes/ ./repositories/
```
## Jest

1. Install Dependencies globally:
```
npm install --save-dev jest
```
2. Run all tests:
```
npm run test
```
3. Get coverage: (Caution: If an error occurres change your ExecutionPolicy to unrestricted)
```
jest --collect-coverage
```
## Folder Structure

```
├── __tests__
│   ├── game.test.js
│   └── services.test.js
├── game
│   └── QuizGame.js
├── middlewares
│   ├── avatar.js
│   ├── index.js
│   └── token.js
├── public
│   ├── assets
│   ├── css-warmupGame
│   ├── css
│   ├── js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── registered.html
│   ├── test-memes.html
│   └── warmup-game.html
├── repositories
│   ├── sql
│   ├── index.js
│   ├── questions.js
│   └── userRepository.js
├── routes
│   ├── auth.js
│   └── index.js
├── services
│   ├── index.js
│   └── passwordValidator.js
├── services
│   └── index.js
├── sockets
│   └── index.js
├── views
│   ├── achievements.ejs
│   ├── dashboard.ejs
│   ├── game.ejs
│   ├── navbar.ejs
│   ├── profile.ejs
│   ├── queue.ejs
│   └── scoreboard.ejs
├── .env
├── .gitignore
├── .prettierrc
├── LICENSE
├── jsdoc.json
├── package-lock.json
├── package.json
├── requests.rest
├── server.js
└── README.md
```

## Contributing

Contributions are welcome! If you find any bugs or want to add new features, please open an issue or submit a pull request.

## License

This project is licensed under the [Eclipse Public License 2.0](https://github.com/ChristianMinich/webtech_project/blob/master/LICENSE).

## Acknowledgments

- [Express](https://expressjs.com/)
- [MariaDB](https://mariadb.org/)
- [uuid](https://www.npmjs.com/package/uuid)

## Contact

If you have any questions, feel free to reach out to [Chris](mailto:christian.minich@hs-osnabrueck.de).

Enjoy playing our Quizduell!
