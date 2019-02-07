const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
// const morgan = require('morgan');
const path = require('path');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();
/*------- Body Parser and Morgan middleware -------*/
// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/*------- DB Config -------*/
const db = require('./config/keys').mongoURI;

/*------- Connect to MongoDB -------*/
// config = {
//     autoIndex: false,
//     useNewUrlParser: true,
// }
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


// const port = process.env.PORT ||5000;       //for Heroku
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
  

// {userNewUrlParser: true}