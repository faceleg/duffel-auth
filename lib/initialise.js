var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  path = require('path'),
  protect = require('./functions/protect'),
  express = require('express'),
  controllerLoader = require('controller-loader'),
  nunjucks = require('nunjucks');

var User = null;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function authenitcateUser(email, password, done) {
    User.getAuthenticated(email, password, function(error, user, reason) {
      if (error) throw error;

      if (user) {
        return done(null, user);
      }

      // otherwise we can determine why we failed
      var reasons = User.failedLogin;
      switch (reason) {
        case reasons.NOT_FOUND:
        case reasons.PASSWORD_INCORRECT:
        case reasons.NOT_ACTIVE:
          // note: these cases are usually treated the same - don't tell
          // the user *why* the login failed, only that it did
          return done(null, false, {
            message: 'Invalid credentials'
          });
        case reasons.MAX_ATTEMPTS:
          // send email or otherwise notify user that account is
          // temporarily locked
          // @todo email user about account lock
          return done(null, false, {
            message: 'Too many failed attempts, account locked temporarily'
          });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  if (user) {
    return done(null, user._id);
  }
  done();
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = function(app, mongoose, connection, userAdditions) {
  app.protect = protect(app);

  require('./models/User').initialise(mongoose, connection, userAdditions);
  User = require('./models/User').model();

  require('../lib/initialisers/assetify')(app);

  app.get('nunjucksEnvironment').loaders
    .push(new nunjucks.FileSystemLoader(path.join(__dirname, 'views')));

  controllerLoader.load(path.resolve(path.join(__dirname, 'controllers')), function(controller) {
    require(controller)({
      app: app
    });
  });

  app.after('session').use(passport.initialize()).as('passport-initialize');
  app.after('passport-initialize').use(passport.session()).as('passport-session');
  app.use('/duffel-auth', express.static(__dirname + '/../public'));
};
