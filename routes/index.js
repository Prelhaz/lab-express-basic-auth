'use strict';

const { Router } = require('express');
const router = Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Hello World!' });
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

const User = require('./../models/user');

const bcrypt = require('bcrypt');

const routeGuardMiddleware = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/authentication/sign-in');
  } else {
    next();
  }
};


router.post('/sign-up', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password, 10)
    .then(hash => {
      return User.create({
        email,
        passwordHash: hash
      });
    })
    .then(user => {
      console.log('Signed up user', user);
      req.session.user = {
        _id: user._id
      };
      res.redirect('/main');
    })
    .catch(error => {
      console.log('There was an error in the sign up process.', error);
    });

  });

  router.get('/sign-in', (req, res, next) => {
    res.render('sign-in');
  });
  
  router.post('/sign-in', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    let auxiliaryUser;
  
    User.findOne({ email })
      .then(user => {
        if (!user) {
          throw new Error('USER_NOT_FOUND');
        } else {
          auxiliaryUser = user;
          return bcrypt.compare(password, user.passwordHash);
        }
      })
      .then(matches => {
        if (!matches) {
          throw new Error('PASSWORD_DOESNT_MATCH');
        } else {
          req.session.user = {
            _id: auxiliaryUser._id
          };
          res.redirect('/private');
        }
      })
      .catch(error => {
        console.log('There was an error signing up the user', error);
        next(error);
      });
  });

  router.get('/private', routeGuardMiddleware, (req, res, next) => {
    res.render('private');
  });
  
  router.get('/main', routeGuardMiddleware, (req, res, next) => {
    res.render('main');
  });
  
  router.post('/sign-out', (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
  });
  
module.exports = router;
