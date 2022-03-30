const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbPromise = (async () => {
    return open ({
        filename: './database.db',
        driver: sqlite3.Database
    });
})();

const getQuestions = async () => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Questions');
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getQuestionById = async (id) => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Questions WHERE questionId=?', id);
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getQuestionsByCategoryId = async (id) => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Questions WHERE categoryId=?', id);
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getQuestionsByCategoryName = async (title) => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Questions WHERE categoryId=(SELECT categoryId FROM Categories WHERE categoryTitle=?)', title);
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getQuestionsByUserId = async (id) => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Questions WHERE authorId=?', id);
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const postQuestion = async (id,data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('INSERT INTO Questions (authorId, categoryId, questionTitle, questionText) VALUES (?,?,?,?)', [id, data.categoryId, data.questionTitle, data.questionText]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const updateQuestionById = async (id, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('UPDATE Questions SET questionTitle=?, questionText=? WHERE questionId=?', [data.questionTitle, data.questionText, id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const deleteQuestionById = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('DELETE FROM Questions WHERE questionId=?', id);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const setQuestionDuplicate = async (id, oid) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('UPDATE Questions SET duplicateId=? WHERE questionId=?', [oid, id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getCategories = async () => {
    try{
        const dbCon = await dbPromise;
        const categories = await dbCon.all('SELECT * FROM Categories');
        return categories;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getCategoryById = async (id) => {
    try{
        const dbCon = await dbPromise;
        const categories = await dbCon.all('SELECT * FROM Categories WHERE categoryId=?', id);
        return categories;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getCategoryByName = async (title) => {
    try{
        const dbCon = await dbPromise;
        const categories = await dbCon.all('SELECT * FROM Categories WHERE categoryTitle=?', title);
        return categories;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getAnswers = async(id) => {
    try{
        const dbCon = await dbPromise;
        const answers = await dbCon.all('SELECT * FROM Answers WHERE questionId=? ORDER BY score DESC', id);
        return answers;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getAnswersById = async(id) => {
    try{
        const dbCon = await dbPromise;
        const answers = await dbCon.all('SELECT * FROM Answers WHERE answerId=?', id);
        return answers;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const setAnswerScore = async(id, score) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('UPDATE Answers SET score=? WHERE answerId=?', [score,id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const postAnswerOnId = async(id, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('INSERT INTO Answers (authorId,questionId,answerTitle,answerText) VALUES (?,?,?,?)',[data.authorId, id, data.answerTitle, data.answerText]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const updateAnswerOnId = async(id, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('UPDATE Answers SET answerTitle=?, answerText=? WHERE answerId=?',[data.answerTitle, data.answerText, id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const deleteAnswerOnId = async(id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('DELETE FROM Answers WHERE answerId=?',id);
    }
    catch(error){
        throw new Error(error.message);
    }
};


const getUsers = async() => {
    try{
        const dbCon = await dbPromise;
        const users = await dbCon.all('SELECT * FROM Users');
        return users;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getUserById = async(id) => {
    try{
        const dbCon = await dbPromise;
        const user = await dbCon.all('SELECT * FROM Users WHERE userId=?', id);
        return user;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const postUser = async( data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('INSERT INTO Users (privilegeId,username,password) VALUES (?,?,?)',[data.privilegeId, data.username, data.password]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const updateUsersById = async(id, data) => {
    try{
        const dbCon = await dbPromise;
        if(data.changePassword){
            await dbCon.run('UPDATE Users SET username=?, password=? WHERE userId=?', [data.username, data.password, id]);
        }
        else{
            await dbCon.run('UPDATE Users SET username=? WHERE userId=?', [data.username, id]);
        }
    }
    catch(error){
        throw new Error(error.message);
    }
};

const updateUsersPrivilegeById = async(id, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('UPDATE Users SET privilegeId=? WHERE userId=?', [data.privilegeId, id]);   
    }
    catch(error){
        throw new Error(error.message);
    }
};


const blockUser = async(id, adminId) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('UPDATE Users SET blockedById=? WHERE userId=?', [adminId, id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const unblockUser = async(id, adminId) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('UPDATE Users SET blockedById=null WHERE userId=?', id);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getUserByName = async(username) => {
    try{
        const dbCon = await dbPromise;
        const user = await dbCon.all('SELECT * FROM Users WHERE username=?', username);
        return user;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const deleteUserById = async(id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('DELETE FROM Users WHERE userId=?', id);
    }
    catch(error){
        throw new Error(error.message);
    }
};


module.exports = {
    getQuestions:getQuestions,
    getQuestionsById:getQuestionById,
    getQuestionsByCategoryId:getQuestionsByCategoryId,
    getQuestionsByCategoryName:getQuestionsByCategoryName,
    getQuestionsByUserId:getQuestionsByUserId,
    postQuestion:postQuestion,
    updateQuestionById:updateQuestionById,
    deleteQuestionById:deleteQuestionById,
    setQuestionDuplicate:setQuestionDuplicate,
    getCategories:getCategories,
    getCategoryById:getCategoryById,
    getCategoryByName: getCategoryByName, 
    getAnswers:getAnswers,
    getAnswersById:getAnswersById,
    setAnswerScore:setAnswerScore,
    updateAnswerOnId:updateAnswerOnId,
    postAnswerOnId:postAnswerOnId,
    deleteAnswerOnId:deleteAnswerOnId,
    getUsers:getUsers,
    getUserById:getUserById,
    postUser:postUser,
    updateUsersById:updateUsersById,
    updateUsersPrivilegeById:updateUsersPrivilegeById,
    blockUser:blockUser,
    getUserByName:getUserByName,
    unblockUser:unblockUser,
    deleteUserById:deleteUserById,
};