USE QUIZDUELL;

CREATE OR REPLACE TABLE ACHIEVEMENT_GAINED (
    USERNAME VARCHAR(255),
    ACHIEVEMENT_ID INTEGER NOT NULL,

    PRIMARY KEY (USERNAME, ACHIEVEMENT_ID)
);