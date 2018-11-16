const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport')

const app = express();
const path = require('path');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

/*------- Body Parser middleware -------*/
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/*------- DB Config -------*/
const db = require('./config/keys').mongoURI;

/*------- Connect to MongoDB -------*/
mongoose.connect(db)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));

app.get('/', (req, res) => res.sendFile (path.join(__dirname + '/index.html')));
// app.get('/', (req, res) => res.send ('Hello Nick'));

//Passport Middleware
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

/*------- Use Routes -------*/
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


const port = process.env.PORT ||5000;       //for Heroku

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
