const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const apiRoutes = require('./apiRoutes');
const webRoutes = require('./webRoutes');
const app = express();
const port = 8000;

const minute = 60000;
const hour = minute * 60;

const cookieMaxAge = hour;

app.use(express.json());
app.use(session({
    name: 'QnASession',
    secret: 'KalleKulaÄrEnDryckSomGörEnStarkOchBlå',
    store: new SQLiteStore,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: cookieMaxAge, sameSite: true}
}));
app.use('/', webRoutes);
app.use('/api', apiRoutes);




app.listen(port,() => {
    console.log(`servern lyssnar nu på http://127.0.0.1:${port}/`);
});