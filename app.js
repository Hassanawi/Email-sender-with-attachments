const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const EmailSender = require('./emailSender');

let email = ''
let password = ''
let subject = ''
let body = ''

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname, 'public')))

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    email = req.body.email;
    password = req.body.password;
    subject = req.body.subject;
    body = req.body.body;
    res.redirect('/index')
});

app.get('/index', async (req, res) => {

    await EmailSender(email, password, subject, body);
    res.render('index');
});

app.listen(8000, () => {
    console.log(`Server started on port http://localhost:8000/login`);
});
