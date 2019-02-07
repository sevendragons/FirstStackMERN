const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

/*------- Load Input Validation -------*/
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

/*------- Load User model -------*/
const User = require('../../models/User')

// --- @route GET localhost:5000/api/users/test -> it's a link  -------*/
// --- @desc Tests user route
// --- @access Public
//
router.get('/test', (req, res) => res.json({
  msg: "Users Works"
}));

// --- @route POST api/users/register -> it's a link  -------*/
// --- @desc Tests user route
// --- @access Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email})
      .then(user => {
        if(user) {
          errors.email = 'Email already exsits';
          return res.status(400).json({ errors }); //key: Email; value: 'Email already exsits'
         } else { 
          const avatar = gravatar.url( req.body.email, {
            s: '200', //Size
            r: 'pg',  //Rating
            d: 'mn'   //Default
          });

          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar,
            password: req.body.password
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              try {
              newUser.password = hash;
              newUser.save()
                     .then(user => res.json(user))
                     .catch(err => console.log(err));
              }
              catch(err) {
                if (err) throw err;
              }
            })
          })
        }
      });
});

// --- @route GET api/users/login -> it's a link  -------*/
// --- @desc Login USer / Returning JWT Token
// --- @access Public

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { errors, isValid } = validateLoginInput(req.body);
  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  // Find user by email
  User.findOne({email})
    .then(user => {
      // Check for users
      if (!user) {
        errors.email = 'User not found';
        return res.status(404).json({errors});
      }
      // else{
      //   return res.json({msg: 'Success email login'})
      // }
      //Check Password
      bcrypt.compare(password, user.password).then(isMatch => {
              if(isMatch) {
                // res.json({msg: 'Success'});
      // User Matched
                const payload = { id: user.id, name: user.name, avatar: user.avatar } //Create JWT Payload

      // Sign Token
                jwt.sign( payload,
                          keys.secretOrKey,
                          { expiresIn: 3600},
                          (err, token) => {
                            res.json({
                              success: true,
                              token: 'Bearer ' + token              //Bearer is a barer token which is a certain type of protocol
                  });
                });
              } else {
                errors.password = 'Password Incorrect Ehhh!👎';
                return res.status(400).json({ errors });

              }
      })
    })
})

// --- @route GET api/users/current -> it's a link  -------*/
// --- @desc Return current user
// --- @access Private
router.get('/current',
            passport.authenticate('jwt',
            {session: false}),
            (req, res) => {
               // res.json({ msg: 'Success' });
               res.json({
                  id: req.user.id,
                  name: req.user.name,
                  email: req.user.email
               });
             }
);

module.exports = router;
