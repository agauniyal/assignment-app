var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

var collegeJson = require('../data/college');
var degreeJson = require('../data/degree');

// TODO: Refactor router into routes and controller

// middleware for further pages
//
// function loggedIn(req, res, next) {
//   if (req.user) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// }

router.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

router.get('/data/college', function(req, res) {

  if (req.user) {
    res.json(collegeJson);
  } else {
    res.status(401).send('Unauthorized').end();
  }
});

router.get('/data/degree', function(req, res) {

  if (req.user) {
    res.json(degreeJson);
  } else {
    res.status(401).send('Unauthorized').end();
  }
});

router.get('/register', function(req, res) {

  if (req.user) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

router.post('/register', function(req, res, next) {

  // validate

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.render('register', { error: errors[0].msg });
  }

  // create new account

  Account.register(new Account({ username: req.body.username }),
    req.body.password,
    function(err, account) {
      if (err) {
        return res.render('register', { error: err.message });
      }

      passport.authenticate('local')(req, res, function() {
        req.session.save(function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/');
        });

      });
    });
});

router.get('/login', function(req, res) {

  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login', { error: req.query.err });
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?err=login error'
}), function(req, res) {

  // TODO: Better login error messages
  // can be done with custom callbacks

  res.redirect('/');
});

router.get('/profile', function(req, res) {

  if (req.user) {
    res.json(req.user);
  } else {
    res.redirect('/login');
  }
});

router.post('/profile', function(req, res) {

  // validation
  //
  req.checkBody('college', 'College is required').notEmpty();
  req.checkBody('degree', 'Degree is required').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.render('index', { error: errors[0].msg, user: req.user });
  }

  // find and update(save)

  Account.find({ username: req.user.username }, function(err, user) {
    if (err) {
      return res.render('index', { error: err.message });
    } else {

      var u = user[0];
      u.college = req.body.college;
      u.degree = req.body.degree;
      u.completedProfile = true;

      u.save(function(err) {
        if (err) { res.status(500).send(err); } else { res.redirect('/'); }
      });
    }
  });
});

router.get('/logout', function(req, res) {

  req.logout();
  res.redirect('/');
});

module.exports = router;