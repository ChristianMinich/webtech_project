USE QUIZDUELL;

#AVATAR
INSERT INTO AVATAR (FILE_PATH) VALUES ('alien_1f47d.png');
INSERT INTO AVATAR (FILE_PATH) VALUES ('alien-monster_1f47e.png');
INSERT INTO AVATAR (FILE_PATH) VALUES ('angry-face-with-horns_1f47f.png');
INSERT INTO AVATAR (FILE_PATH) VALUES ('anguished-face_1f627.png');
INSERT INTO AVATAR (FILE_PATH) VALUES ('anxious-face-with-sweat_1f630.png');
INSERT INTO AVATAR (FILE_PATH) VALUES ('astonished-face_1f632.png');

#USERNAME
INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES ('sadik.slimshady', 'pass12345', 100, 1);
INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES ('jan-detti', 'password123465', 50, 1);
INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES ('frauchraih', 'miaumiau789', 10, 1);
INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES ('drachy.minich', 'max187187', 170, 1);
INSERT INTO USER (USERNAME, PASSWORD, HIGHSCORE, AVATAR_ID) VALUES ('_tonyx_', 'hubsch-88', 5, 1);

#CATEGORY
INSERT INTO CATEGORY (CATEGORY) VALUES ('Hochschule');
INSERT INTO CATEGORY (CATEGORY) VALUES ('Informatik');
INSERT INTO CATEGORY (CATEGORY) VALUES ('Random');

#QUESTION
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Wann wurde der Campus in Lingen errichtet?', '2012', '2009', '2005', '2014', 1);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Welches ist das Wahrzeichen von Lingen(Ems)?', 'Ein Turm der Stadtmauer', 'Ein Leuchtturm', 'Ein Turm der Stadtmauer', 'Ein Schloss', 2);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Wie viele Einwohner hat Lingen(Ems)?', '50.000', '20.000', '80.000', '120.000', 3);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Was bedeutet das Kürzel "HTML"?', 'Hyperlink Text Markup Language', 'High Tech Management Library', 'Human Terminal Management Logic', 'Hardware Transmission Multiplexing Layer', 2);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Wie viele Beine hatte Jesus?', '3', '2', 'Man weiß es nicht ganz genau', '5', 3);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Was ist eine "Shell"?', 'Eine Texteingabeaufforderung, die Befehle ausführt', 'Eine grafische Benutzeroberfläche für Betriebssysteme', 'Eine Software zum Schutz von Computern vor Viren', 'Eine Bibliothek mit Grafikfunktionen zur Erstellung von 3D-Animationen', 2);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Würde Rauscher gute Noten verteilen?', 'Ja wie meine Mutter', 'Nein, maximal 4.0', 'Nein', 'Nein', 3);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Was ist ein Turing-Test?', 'Ein Test zur Messung der Fähigkeit eines Computers, menschliches Verhalten zu imitieren', 'Ein Test zur Messung der Intelligenz eines Menschen', 'Ein Test zur Messung der Leistung eines Computers', 'Ein Test zur Messung der Fähigkeit eines Menschen, Programmiersprachen zu erlernen', 2);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Wie viele Tasten hat eine durchschnittliche Computermaus?', '10 Tasten', '1 Taste', '3 Tasten', '2 Tasten', 2);
INSERT INTO QUESTION (QUESTION, RIGHT_ANSWER, FALSE_ANSWER1, FALSE_ANSWER2, FALSE_ANSWER3, CATEGORY_ID) VALUES ('Was bedeutet das Kürzel "HTTP"?', 'Hypertext Transmission Protocol', 'Hyper Transfer Text Programming', 'Human Terminal Transaction Platform', 'Hardware Transmission Telephony Process', 2);

#GAME
INSERT INTO GAME (USER_ID, CATEGORY_ID) VALUES (1, 1);
INSERT INTO GAME (USER_ID, CATEGORY_ID) VALUES (4, 1);
INSERT INTO GAME (USER_ID, CATEGORY_ID) VALUES (2, 2);
INSERT INTO GAME (USER_ID, CATEGORY_ID) VALUES (5, 2);
INSERT INTO GAME (USER_ID, CATEGORY_ID) VALUES (3, 3);
INSERT INTO GAME (USER_ID, CATEGORY_ID) VALUES (1, 3);

#BELONG
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (1, 100);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (2, 100);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (3, 100);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (4, 200);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (5, 300);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (6, 200);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (7, 100);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (8, 200);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (9, 200);
INSERT INTO BELONG (QUESTION_ID, GAME_ID) VALUES (10, 200);
