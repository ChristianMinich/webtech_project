USE QUIZDUELL;

CREATE OR REPLACE TABLE BELONG (
    QUESTION_ID INTEGER,
    GAME_ID INTEGER,

    PRIMARY KEY (QUESTION_ID, GAME_ID)
);