const router = require('express').Router();
const viewFolder = __dirname + '/html/';

router.get('/', (req,res) =>{
    res.sendFile(viewFolder + 'index.html');
});

router.get('/question/:id', (req,res)=>{
    res.sendFile(viewFolder + 'question.html');
});

router.get('/category/:id', (req,res)=>{
    res.sendFile(viewFolder + 'category.html');
});

router.get('/user', (req,res)=>{
    res.sendFile(viewFolder + 'userProfile.html');
});

router.get('/admin', (req,res) =>{
    res.sendFile(viewFolder + 'admin.html');
});



module.exports = router;
