const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

//Load Profile Model
const Profile = require('../../models/Profile');
// Load User model
const User = require('../../models/User');


/*------- @route GET api/profile/test -> it's a link  -------*/
//@desc Tests profile route
// @access Public
router.get('/test', (req, res) => res.json({
  msg: 'this is just a test profile'
}));

/*------- @route GET api/profile it's a link  -------*/
//@desc GET current users profile
// @access Private
router.get('/', passport.authenticate('jwt', {session: false}),
 (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noProfile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch( err => {
      res.status(404).json(err);
    });
  }
);

/*------- @route GET api/profile/all -------*/
//@desc Get all profiles
// @access Public ----- This is Public data
router.get('/all', (req, res) => {
const errors = {};
  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profiles => {
    if(!profiles){
      errors.noProfile = 'There is no profiles';
      return res.status(404).json(errors);
    }
    res.json(profiles);
  })
  .catch( err => {
    res.status(404).json({profile: 'There are no profiles'})
  })
});


/*------- @route GET api/profile/handle/ :handle -------*/
//@desc Get profile by handle
// @access Public ----- This is Public data

router.get('/handle/:handle',(req, res) => {
const errors = {};

  Profile.findOne({ handle: req.params.handle })
  .populate('user', ['name', 'avatar'])
  .then(profile => {
    if (!profile) {
      errors.noProfile = 'There is no profile for this user';
      res.status(404).json(errors);
    }
    res.json(profile);
  })
  .catch(err => res.status(404).json(err))
})

/*------- @route GET api/profile/user/ :user_id -------*/
//@desc Get profile by user ID
// @access Public ----- This is Public data

router.get('/user/:usrer_id',(req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
  .populate('user', ['name', 'avatar'])
  .then(profile => {
    if (!profile) {
      errors.noProfile = 'There is no profile for this user';
      res.status(404).json(errors);
    }
    res.json(profile);
  })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}) );
});



/*------- @route POST api/profile it's a link  -------*/
//@desc Create or POST and edit  current users profile
// @access Private
router.post('/', passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check Validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }
    // GET fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubUserName) profileFields.githubUserName = req.body.githubUserName;
    if(req.body.date) profileFields.date = req.body.date;

    //Skills - Split into array
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    //Social initialize profileField
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;


    Profile.findOne({ user: req.user.id})
      .then(profile => {
        if(profile) {
          //Update Profile
          Profile.findOneAndUpdate({
            user: req.user.id},
            {$set: profileFields },
            {new: true})
          .then(profile => res.json(profile));
        }else {
        //Check if handle exsits
        Profile.findOne({ handle: profileFields.handle}).then(profile => {
          if (profile) {
              errors.handle = 'That handle already exists';
              res.status(400).json(errors);
          }

          //Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

/*------- @route POST api/profile/experience -------*/
//@desc Add experience to profile but different route not inside user --- what the hex
// @access Private ----- This is Private data
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);

/*------- @route POST api/profile/education -------*/
//@desc Add education to profile but different route not inside user --- what the hex
// @access Private ----- This is Private data
router.post('/education', passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    //Check Validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.company,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
});

/*------- @route DELETE api/profile/experience -------*/
//@desc delete experience to profile but different route not inside user --- what the hex
// @access Private ----- This is Private data
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}),
  (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.prams.exp_id);

        //Splice out of array
        profile.experience.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profiel));
    })
    .catch(err => res.status(404).json(err));
});

/*------- @route DELETE api/profile/education -------*/
//@desc Delete education to profile --- what the hex
// @access Private ----- This is Private data
router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}),
  (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.prams.edu_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

/*------- @route DELETE api/profile/-------*/
//@desc Delete user and profile --- what the hex
// @access Private ----- This is Private data
router.delete('/', passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => {
          res.json({ success: true });
        });
    });
});


module.exports = router;
