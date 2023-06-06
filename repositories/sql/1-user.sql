USE QUIZDUELL;

CREATE OR REPLACE TABLE USER (
    USER_ID INTEGER AUTO_INCREMENT,
    USERNAME VARCHAR(20) NOT NULL,
    PASSWORD VARCHAR(64) NOT NULL CHECK (LENGTH(PASSWORD) >= 8),
    HIGHSCORE INTEGER,
    AVATAR_ID INTEGER NOT NULL,
    WINS INTEGER NOT NULL,
    CONCURRENT_WINS INTEGER NOT NULL,
    PERFECT_WINS INTEGER NOT NULL,
    LOSES INTEGER NOT NULL,

    PRIMARY KEY (USER_ID)
);

