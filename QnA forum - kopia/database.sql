DROP TABLE Users;
CREATE TABLE IF NOT EXISTS Users(
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    privilegeId INTEGER NOT NULL,
    username VARCHAR(32) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    blockedById INTEGER,
    FOREIGN KEY (privilegeId) REFERENCES Privileges (privilegeId),
    FOREIGN KEY (blockedById) REFERENCES Users (userId)
);
DROP TABLE Privileges;
CREATE TABLE IF NOT EXISTS Privileges(
    privilegeId INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(16),
    description VARCHAR(64)
);
DROP TABLE Questions;
CREATE TABLE IF NOT EXISTS Questions(
    questionId INTEGER PRIMARY KEY AUTOINCREMENT,
    authorId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    questionTitle VARCHAR(32) NOT NULL,
    questionText VARCHAR(1024) NOT NULL,
    duplicateId INTEGER,
    timeStamp DATE DEFAULT (datetime('now','localtime')) NOT NULL,
    FOREIGN KEY (authorId) REFERENCES Users(userId),
    FOREIGN KEY (duplicateId) REFERENCES Questions(questionId),
    FOREIGN KEY (categoryId) REFERENCES Categories(categoryId)
);  
DROP TABLE Categories;
CREATE TABLE IF NOT EXISTS Categories(
    categoryId INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryTitle VARCHAR(32) NOT NULL
);

DROP TABLE Answers;
CREATE TABLE IF NOT EXISTS Answers(
    answerId INTEGER PRIMARY KEY AUTOINCREMENT,
    authorId INTEGER NOT NULL,
    questionId INTEGER NOT NULL,
    answerTitle VARCHAR(32) NOT NULL,
    answerText VARCHAR(1024) NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    timeStamp DATE DEFAULT (datetime('now','localtime')) NOT NULL,
    FOREIGN KEY (authorId) REFERENCES Users(userId),
    FOREIGN KEY (questionId) REFERENCES Questions(questionId)
);

INSERT INTO Categories (categoryTitle) VALUES ('Other');
INSERT INTO Categories (categoryTitle) VALUES ('Networking Hardware');
INSERT INTO Categories (categoryTitle) VALUES ('Buissiness Computer Hardware');
INSERT INTO Categories (categoryTitle) VALUES ('Networking Software');
INSERT INTO Categories (categoryTitle) VALUES ('General Software');
INSERT INTO Categories (categoryTitle) VALUES ('Front End');


