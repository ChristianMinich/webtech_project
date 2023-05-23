USE quizduell;

#USERNAME
INSERT INTO user VALUES (1, 'sadik.slimshady', 'pass12345', 100, 10);
INSERT INTO user VALUES (2, 'jan-detti', 'password123465', 50, 10);
INSERT INTO user VALUES (3, 'frauchraih', 'miaumiau789', 10, 20);
INSERT INTO user VALUES (4, 'drachy.minich', 'max187187', 170, 20);
INSERT INTO user VALUES (5, '_tonyx_', 'hubsch-88', 5, 10);


#QUESTION
INSERT INTO question VALUES (1, 'Wann wurde der Campus in Lingen errichtet?', '2012', '2009', '2005', '2014', 1);
INSERT INTO question VALUES (2, 'Welches ist das Wahrzeichen von Lingen(Ems)?', 'Ein Turm der Stadtmauer', 'Ein Leuchtturm', 'Ein Turm der Stadtmauer', 'Ein Schloss', 2);
INSERT INTO question VALUES (3, 'Wie viele Einwohner hat Lingen(Ems)?', '50.000', '20.000', '80.000', '120.000', 3);
INSERT INTO question VALUES (4, 'Was bedeutet das Kürzel "HTML"?', 'Hyperlink Text Markup Language', 'High Tech Management Library', 'Human Terminal Management Logic', 'Hardware Transmission Multiplexing Layer', 2);
INSERT INTO question VALUES (5, 'Wie viele Beine hatte Jesus?', '3', '2', 'Man weiß es nicht ganz genau', '5', 3);
INSERT INTO question VALUES (6, 'Was ist eine "Shell"?', 'Eine Texteingabeaufforderung, die Befehle ausführt', 'Eine grafische Benutzeroberfläche für Betriebssysteme', 'Eine Software zum Schutz von Computern vor Viren', 'Eine Bibliothek mit Grafikfunktionen zur Erstellung von 3D-Animationen', 2);
INSERT INTO question VALUES (7, 'Würde Rauscher gute Noten verteilen?', 'Ja wie meine Mutter', 'Nein, maximal 4.0', 'Nein', 'Nein', 3);
INSERT INTO question VALUES (8, 'Was ist ein Turing-Test?', 'Ein Test zur Messung der Fähigkeit eines Computers, menschliches Verhalten zu imitieren', 'Ein Test zur Messung der Intelligenz eines Menschen', 'Ein Test zur Messung der Leistung eines Computers', 'Ein Test zur Messung der Fähigkeit eines Menschen, Programmiersprachen zu erlernen', 2);
INSERT INTO question VALUES (9, 'Wie viele Tasten hat eine durchschnittliche Computermaus?', '10 Tasten', '1 Taste', '3 Tasten', '2 Tasten', 2);
INSERT INTO question VALUES (10, 'Was bedeutet das Kürzel "HTTP"?', 'Hypertext Transmission Protocol', 'Hyper Transfer Text Programming', 'Human Terminal Transaction Platform', 'Hardware Transmission Telephony Process', 2);

#GAME
INSERT INTO game VALUES (100,1, 1 );
INSERT INTO game VALUES (100,4, 1 );
INSERT INTO game VALUES (200,2, 2);
INSERT INTO game VALUES (200,5, 2);
INSERT INTO game VALUES (300,3, 3);
INSERT INTO game VALUES (300,1, 3);

#AVATAR
INSERT INTO avatar VALUES (10, NULL);
INSERT INTO avatar VALUES (20, NULL);

#BELONG
INSERT INTO belong VALUES (1, 100);
INSERT INTO belong VALUES (2, 100);
INSERT INTO belong VALUES (3, 100);
INSERT INTO belong VALUES (4, 200);
INSERT INTO belong VALUES (5, 300);
INSERT INTO belong VALUES (6, 200);
INSERT INTO belong VALUES (7, 100);
INSERT INTO belong VALUES (8, 200);
INSERT INTO belong VALUES (9, 200);
INSERT INTO belong VALUES (10, 200);

#CATEGORY
INSERT INTO CATEGORY VALUES (1, 'Hochschule');
INSERT INTO CATEGORY VALUES (2, 'Informatik');
INSERT INTO CATEGORY VALUES (3, 'Random');