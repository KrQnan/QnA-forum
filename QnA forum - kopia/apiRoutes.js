
const routes = require('express').Router();
const dbservice = require('./database');
const bcrypt = require('./bcrypt.js');

/*
    Question routes











*/

routes.get('/questions/', async (req, res) =>{
    try{
        const questions = await dbservice.getQuestions();
        for(var i = 0; i < questions.length; i++){
            var user = await dbservice.getUserById(questions[i].authorId);
            questions[i].username = user[0].username;
        }
        res.json(questions);
    }
    catch(error){
        console.log(error.message);
        res.json({error: 'Database Failed'});
    }
});

routes.get('/questions/:id', async (req, res) =>{
    const id = req.params.id;
    try{
        const question = await dbservice.getQuestionsById(id);
        if(question <1){
            res.json({error: 'No Question with such id'});
            return;
        }
        else{
            for(var i = 0; i < question.length; i++){
                var user = await dbservice.getUserById(question[i].authorId);
                question[i].username = user[0].username;
            }
            res.json(question);
        }
        
    }
    catch(error){
        console.log(error.message);
        res.json({error: 'Database Failed'});
    }
});

routes.get('/questions/category/:id', async (req, res) =>{
    const id = req.params.id;
    try{
        const questions = await dbservice.getQuestionsByCategoryId(id);
        if(questions <1){
            res.json({error: 'The category has no questions'});
            return;
        }
        else{
            for(var i = 0; i < questions.length; i++){
                var user = await dbservice.getUserById(questions[i].authorId);
                questions[i].username = user[0].username;
            }
            res.json(questions);
        }
        
    }
    catch(error){
        console.log(error.message);
        res.json({error: 'Database Failed'});
    }
});

routes.get('/questions/category/:id/faq', async (req, res) =>{
    const id = req.params.id;
    try{
        var questions = await dbservice.getQuestionsByCategoryId(id);
        if(questions <1){
            res.json({error: 'The category has no questions'});
            return;
        }
        else{
            for(var i = 0; i < questions.length; i++){
                var user = await dbservice.getUserById(questions[i].authorId);
                questions[i].username = user[0].username;
                questions[i].occurance = 0;

                for(var j = 0; j < questions.length; j++){
                    if(questions[j].duplicateId == questions[i].questionId){
                        questions[i].occurance++;
                    }
                }
            }   
            questions = questions.filter(function(e) {
                return e.duplicateId == null && e.occurance != 0;
            });
            questions.sort((a, b) => (a.occurance > b.occurance) ? -1 : 1)
            res.json(questions);
        }
        
    }
    catch(error){
        console.log(error.message);
        res.json({error: 'Database Failed'});
    }
});

routes.post('/questions/post', async (req,res) => {
    const data = req.body;

    if(!req.session.userId){
        res.json({error: 'You must be logged in to perform this action'});
        return;
    }
    try{
        await dbservice.postQuestion(req.session.userId,data);
        res.json({message: 'Posted new Question'});
    }
    catch(error){
        res.json({error: error.message});
    }
});


routes.put('/questions/edit/:id', async (req,res) => {
    const id = req.params.id;
    const data = req.body;

    if(!req.session.userId){
        res.json({error: 'You must be logged in to perform this action'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const question = await dbservice.getQuestionsById(id);


        if(loggedInUser < 1 || question < 1){
            res.json({error: 'id missmatch somewhere'})
        }
        if(loggedInUser[0].userId == question[0].authorId){
            await dbservice.updateQuestionById(id, data);
            res.json({message: 'Success'});
            return;
        }
        else{
            res.json({ error: 'You do not have permission to make this action'});
            return;
        }
    }
    catch(error){
        res.json({error: error.message});
    }
});

routes.delete('/questions/delete/:id', async (req,res) => {
    const id = req.params.id;

    if(!req.session.userId){
        res.json({error: 'You must be logged in to perform this action'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const question = await dbservice.getQuestionsById(id);


        if(loggedInUser < 1 || question < 1){
            res.json({error: 'id missmatch somewhere'})
        }
        if(loggedInUser[0].userId == question[0].authorId){
            await dbservice.deleteQuestionById(id);
            res.json({message: 'Success'});
            return;
        }
        else{
            res.json({ error: 'You do not have permission to make this action'});
            return;
        }
    }
    catch(error){
        res.json({error: error.message});
        console.log(error.message);
    }
});

routes.put('/questions/duplicate/:id', async (req, res) => {
    const questionId = req.params.id;
    const duplicateId = req.body.duplicateId;

    if(!req.session.userId){
        res.json({error: 'You have to be logged in to make this request'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const questionToUpdate = await dbservice.getQuestionsById(questionId);
        if(duplicateId != null){
            const originalQuestion = await dbservice.getQuestionsById(duplicateId);
            if(loggedInUser[0].privilegeId == 3){
                res.json({error: 'You do not have permission to make this request'});
                return;
            }
            if(questionToUpdate < 1){
                res.json({error: 'Question to update not found'});
                return;
            }
            if(originalQuestion < 1){
                res.json({error: 'Original question not found'});
                return;
            }
            await dbservice.setQuestionDuplicate(questionId, duplicateId);
            res.json({message: 'Question set as duplicate'});
        }
        else{
            if(loggedInUser[0].privilegeId == 3){
                res.json({error: 'You do not have permission to make this request'});
                return;
            }
            if(questionToUpdate < 1){
                res.json({error: 'Question to update not found'});
                return;
            }
            await dbservice.setQuestionDuplicate(questionId, duplicateId);
            res.json({message: 'Question set as original'});
        }
        
    }
    catch(error){
        res.json({error: error.message});
        console.log(error.message);
    }
});


/*
    Answer routes









*/


routes.get('/answers/:id', async (req, res) =>{
    const id = req.params.id;
    try{
        const answers = await dbservice.getAnswers(id);
        if(answers < 1){
            res.json({error: 'No answer with that id'});
            return;
        }
        else{
            for(var i = 0; i < answers.length; i++){
                var user = await dbservice.getUserById(answers[i].authorId);
                answers[i].username = user[0].username;
            }
            res.json(answers);
        }
        
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.put('/answers/:id/upvote', async (req, res) =>{
    const id = req.params.id;

    if(!req.session.userId){
        res.json({error: 'You have to be logged in to update the score'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const answers = await dbservice.getAnswersById(id);
        
        if(answers < 1){
            res.json({error: 'No answer with that id'});
            return;
        }
        else{
            const question = await dbservice.getQuestionsById(answers[0].questionId);

            if(loggedInUser[0].userId == question[0].authorId){
                await dbservice.setAnswerScore(id, (answers[0].score + 1));
                res.json(answers);
            }
        }
  
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.put('/answers/:id/downvote', async (req, res) =>{
    const id = req.params.id;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to update the score'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const answers = await dbservice.getAnswersById(id);
        
        if(answers < 1){
            res.json({error: 'No answer with that id'});
            return;
        }
        else{
            const question = await dbservice.getQuestionsById(answers[0].questionId);

            if(loggedInUser[0].userId == question[0].authorId){
                await dbservice.setAnswerScore(id, (answers[0].score - 1));
                res.json(answers);
            }
        }
  
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.post('/answers/post/:id', async (req,res) => {
    const id = req.params.id;
    const data = req.body;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to post answers'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        
        if(loggedInUser[0].privilegeId != 2){
            res.json({error: 'You have to be a contributor to post answers'});
            return;
        }
        else{
            if(data.authorId != loggedInUser[0].userId){
                res.json({error: 'Loggin was unsynced:' + data.authorId + ', '+ loggedInUser[0].userId});
                return;
            }
            await dbservice.postAnswerOnId(id, data);
            res.json({message: 'Posted answer'});
            return;
        }
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }

});

routes.put('/answers/edit/:id', async (req,res) => {
    const id = req.params.id;
    const data = req.body;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to post answers'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const answer = await dbservice.getAnswersById(id);
        
        if(loggedInUser[0].privilegeId != 2){
            res.json({error: 'You have to be a contributor to post answers'});
            return;
        }
    
        if(answer[0].authorId != loggedInUser[0].userId){
            res.json({error: 'You do not have permission to make this request'});
            return;
        }
        await dbservice.updateAnswerOnId(id, data);
        res.json({message: 'Updated answer'});
        return;
        
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }

});

routes.delete('/answers/delete/:id', async (req,res) => {
    const id = req.params.id;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to post answers'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const answer = await dbservice.getAnswersById(id);

    
        if(answer[0].authorId != loggedInUser[0].userId){
            res.json({error: 'You do not have permission to make this request'});
            return;
        }
        await dbservice.deleteAnswerOnId(id);
        res.json({message: 'Answer deleted'});
        return;
        
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }

});


/*

    Category routes


*/

routes.get('/category', async (req,res)=>{
    try{
        const category = await dbservice.getCategories();

        if(category < 1){
            res.json({error: 'No categories found'});
            return;
        }
        else{
            res.json(category);
        }
    }
    catch(error){
        res.json({error: error.message});
        console.log(error);
    }
});

routes.get('/category/:id', async (req,res)=>{
    const id = req.params.id;

    try{
        const category = await dbservice.getCategoryById(id);

        if(category < 1){
            res.json({error: 'No category with such id'});
            return;
        }
        else{
            res.json(category);
        }
    }
    catch(error){
        res.json({error: error.message});
        console.log(error);
    }
});


/*
    User routes







*/



routes.get('/users', async (req, res) =>{
    if(!req.session.userId){
        res.json({error: 'You have to be logged in as admin to watch users'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        if(loggedInUser[0].privilegeId == 1){
            const users = await dbservice.getUsers();
            for(var i = 0; i < users.length; i++){
                users[i].password = '*******';
            }
            res.json(users);
        }
        else{
            res.json({error: 'You have to be SUPER ADMIN to see all users'});
        }
    }
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.post('/users/post', async (req,res) => {
    const data = req.body;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in as admin to add users'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const user = await dbservice.getUserByName(data.username);

        
        if(loggedInUser[0].privilegeId != 1){
            res.json({error: 'You have to be a Admin to add users'});
            return;
        }
        if(user.length > 0){
            res.json({error: 'This username is already taken'});
            return;
        }
        data.password = await bcrypt.generatePassword(data.password);
        await dbservice.postUser(data);
        res.json({message: 'Posted user'});
        return;
    } 
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }

});


routes.put('/users/edit/:id', async (req, res) =>{
    const id = req.params.id;
    const data = req.body;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to do this'});
        return;
    }
    try{
        
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const username = await dbservice.getUserByName(data.username);

        if(loggedInUser[0].userId != id){
            res.json({error: 'You cant change this profile'});
            return;
        }
        if(username.length > 0 && username[0].username != loggedInUser[0].username){
            res.json({error: 'Username already taken'});
            return;
        }
        data.password = await bcrypt.generatePassword(data.password);
        await dbservice.updateUsersById(id, data);
        res.json({message: 'User updated'});
        
        
    }
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.put('/users/privilege/:id', async (req, res) =>{
    const id = req.params.id;
    const data = req.body;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to do this'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const user = await dbservice.getUserById(id);

        if(user < 1){
            res.json({error: 'User not found'});
            return;
        }
        console.log(loggedInUser[0]);
        if(loggedInUser[0].privilegeId != 1){
            res.json({error: 'You cant change this profile'});
            return;
        }

        await dbservice.updateUsersPrivilegeById(id, data);
        res.json({message: 'User updated'});
        
        
    }
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.get('/users/questions/:id', async (req,res) => {
    const id = req.params.id;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to watch a specific users questions'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        if(loggedInUser[0].privilegeId == 1 || loggedInUser[0].userId == id){
            const questions = await dbservice.getQuestionsByUserId(id);
            res.json(questions);
        }
        else{
            res.json({error: 'You have to be SUPER ADMIN or the author to look at this question'});
        }
    }
    catch(error){
        console.log(error.message);
        res.json({error: error.message});
    }
});

routes.get('/myuser', async(req,res) =>{
    if(!req.session.userId){
        res.json({error: 'You are now logged out'});
    }
    else{
        try{
            const myuser=await dbservice.getUserById(req.session.userId);
            myuser[0].password = '*******';
            res.json(myuser[0]);
        }catch(error){
            res.json({error: error.message})
        }
    }
})

routes.get('/users/:id', async(req,res) => {
    const id = req.params.id;
    try{
        const users = await dbservice.getUserById(id);
        
        if(users < 1){
            res.json({error: 'No User with such id'});
            return;
        }
        else{
            
            users[0].password = '*******';
            res.json(users);
        }
        

    }
    catch(error){
        console.log(error.message),
        res.json({error: error.message});
    }
});

routes.delete('/users/delete/:id', async(req,res) => {
    const id = req.params.id;
    if(!req.session.userId){
        res.json({error: 'You have to be logged in to make this request'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        const users = await dbservice.getUserById(id);
        if(loggedInUser[0].privilegeId != 1){
            res.json({error: 'You have to be SUPER ADMIN to make this request'});
        }
        if(users < 1){
            res.json({error: 'No User with such id'});
            return;
        }
        else{
            await dbservice.deleteUserById(id);
            res.json({message: 'User Deleted'});
            return
        }
    }
    catch(error){
        console.log(error.message),
        res.json({error: error.message});
    }
});


/*
    Blocking routes








*/


routes.put('/block/:id', async(req,res) =>{
    const id = req.params.id;
    if(!req.session.userId){
        res.json({ error: 'You have to be logged in as SUPER ADMIN to block a user'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        if(loggedInUser[0].privilegeId == 1){
            const userToBlock = await dbservice.getUserById(id);
            if(userToBlock[0].blockedById == null){
                await dbservice.blockUser(id,loggedInUser[0].userId);
                res.json({message: 'User is blocked'});
                return;
            }
            else{
                res.json({error: 'User is already blocked'});
            }
        }
        else{
            res.json({error: 'You do not have permission to block a user'});
        }
    }
    catch(error){
        console.log(error.message),
        res.json({ error: error.message});
        return;
    }
});

routes.put('/unblock/:id', async(req,res) =>{
    const id = req.params.id;
    if(!req.session.userId){
        res.json({ error: 'You have to be logged in as SUPER ADMIN to unblock a user'});
        return;
    }
    try{
        const loggedInUser = await dbservice.getUserById(req.session.userId);
        if(loggedInUser[0].privilegeId == 1){
            const userToBlock = await dbservice.getUserById(id);
            if(userToBlock[0].blockedById != null){
                await dbservice.unblockUser(id);
                res.json({error: 'User is unblocked'});
            }
            else{
                res.json({error: 'User is already not blocked'});
            }
        }
        else{
            res.json({error: 'You do not have permission to block a user'});
        }
    }
    catch(error){
        console.log(error.message),
        res.json({ error: error.message});
        return;
    }
});

/*
    Logging routes










*/


routes.post('/login', async(req,res) =>{
    const username = req.body.username;
    const password = req.body.password;
    if(req.session.userId){
        res.json({error: 'Already loggedIn'});
        return;
    }

    try{
        const users = await dbservice.getUserByName(username);
        if(users < 1){
            res.json({error: 'No User with such username'});
            return;
        }
        if(users[0].blockedById != null){
            res.json({error: 'User is blocked'});
            return;
        }
        if(await bcrypt.comparePass(password, users[0].password)){
            req.session.userId = users[0].userId;
            users[0].password = '*******'
            res.json(users[0]);
        }
        else{
            res.json({error: 'Password not matching'});
        }
        
    }
    catch(error){
        console.log(error.message),
        res.json({error: error.message});
    }

});

routes.post('/logout', async(req,res) =>{
    try{
        if(req.session.userId){
            req.session.destroy();
            res.json({error: 'Logged out'});
        }
        else{
            res.json({error: 'You are not logged in'});
        }
    }
    catch(error){
        console.log(error.message),
        res.json({error: error.message});
    }

});


module.exports = routes;