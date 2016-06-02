var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

var collegeJson = require('../data/college');

var colleges = [];
collegeJson.forEach(function(el, index, array) {
  colleges.push(el.name.toLowerCase());
});

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
    if (req.query.college) {

      var collegeName = req.query.college.toLowerCase();
      var degrees = [];
      collegeJson.find(function(el, i, arr) {
        if (el.name.toLowerCase() === collegeName) {
          degrees = el.degrees;
        }
      });
      res.json(degrees);
    } else { res.json(colleges); }
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

router.post('/login', function(req, res, next) {

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.render('login', { error: errors[0].msg });
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err); }
    if (!user) {
      return res.render('login', { error: info.message }); }
    req.logIn(user, function(err) {
      if (err) {
        return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
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

  var collegeName = req.body.college.toLowerCase();
  var degreeName = req.body.degree;

  var degrees = [];
  collegeJson.find(function(el, i, arr) {
    if (el.name.toLowerCase() === collegeName.toLowerCase()) {
      degrees = el.degrees;
    }
  });

  // convert to lowercase and compare
  degrees = degrees.join(',').toLowerCase().split(',');

  var checkIndex = degrees.indexOf(degreeName);

  if (checkIndex == -1) {
    return res.render('index', { error: "College and degree don't match", user: req.user });
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
