const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Posts');

//Validation
 const validatePostInput = require('../../validation/post');


/*------- @route GET api/posts/test -> it's a link  -------*/
//@desc Tests post route
// @access Public
router.get('/posts', (req, res) => res.json({
  msg: "Posts Works"

}));

/*------- @route GET api/posts/ -> it's a link  -------*/
//@desc GET posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1})     // sort data in post
    .then(posts => res.json(posts))
    .catch(err => res.status(404));
});

/*------- @route GET api/posts/:id -------*/
//@desc GET posts by id
// @access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({noPostFound: 'No post found with that ID'}));
});

/*------- @route DELETE api/posts/:id -------*/
//@desc GET posts by id
// @access Private
router.delete('/:id',passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Profile.findOne({user: req.user.id})
      .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if(post.user.toString() !== req.user.id){
            return res.statis(401).json({ notAuthorized: 'User not authorized ' });             //401 Status is am Authorization or Unauthorization status
          }

          //Delete post
            post.remove().then( () => res.json({ success: true}) );
        })
        .catch(err => res.status(404).json({postNotFound: 'No post found'}));
  });
});

/*------- @route POST api/posts/like/:id -------*/
//@desc Like posts by id
// @access Private
router.post('/like/:id',passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Profile.findOne({user: req.user.id})
      .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length >  0) {
            return res.status(400).json({ alreadyLiked: 'User already liked this post'})
          }

          //Add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({postNotFound: 'No post found'}));
  });
});

/*------- @route POST api/posts/unlike/:id -------*/
//@desc UnLike posts by id
// @access Private
router.post('/unlike/:id',passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Profile.findOne({user: req.user.id})
      .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
          if( post.likes.filter(like => like.user.toString() === req.user.id ).length === 0) {
            return res.status(400).json({ notLiked: 'User already liked this post'});
          }

          //Get remove index
          const removeIndex  = post.likes
            .map( item => item.user.toString() )
            .indexOf( req.user.id );

            //Splice out of array
            post.likes.splice(removeIndex, 1);

            //save
            post.save().then( post => res.json(post));
        })
        .catch(err => res.status(404).json({postNotFound: 'No post found'}));
  });
});


/*------- @route POST api/posts/ -> it's a link  -------*/
//@desc Create post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check Validation
    if(!isValid) {
      //If any errors, semd 400 with errors Object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id

    });
    newPost.save().then(post => res.json(post));
  }
);

/*------- @route POST api/posts/comment/:id -> it's a link  -------*/
//@desc Add comment to post
// @access Private

router.post('/comment/:id', passport.authenticate('jwt', { session: false}),
  (req, res) => {
    Post.findById( req.params.id )
      .then(post => {
        const { errors, isValid } = validatePostInput(req.body);

        //Check Validation
        if(!isValid) {
          //If any errors, semd 400 with errors Object
          return res.status(400).json(errors);
        }

        const newComment = {
          text:  req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        }

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postNotFound: 'No Post Found' }));
  }
);


/*------- @route DELETE api/posts/comment/:id/:comment_id -> it's a link  -------*/
//@desc Remove comment from post
// @access Private

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false}),
  (req, res) => {
    Post.findById( req.params.id )
      .then(post => {
        // Check to see if comment exists
        if (post.comments.filter( comment => comment._id.toString() === req.params.comment_id ).length === 0 ) {
          return res
            .status(404)
            .json({ commentNotExists: 'Comment does not exist'});
        }

        //Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

          //Splice comment out of array
          post.comments.splice( removeIndex, 1 );

          post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postNotFound: 'No Post Found' }));
  }
);


module.exports = router;
