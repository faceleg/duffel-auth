var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  path = require('path'),
  protect = require('./functions/protect'),
  express = require('express'),
  controllerLoader = require('controller-loader'),
  authentication = require('./middleware/authentication'),
  nunjucks = require('nunjucks'),
  User = require('./models/User.js').model;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.getAuthenticated(email, password, function(err, user, reason) {
      if (err) throw err;

      if (user) {
          return done(user);
      }

      // otherwise we can determine why we failed
      var reasons = User.failedLogin;
      switch (reason) {
          case reasons.NOT_FOUND:
          case reasons.PASSWORD_INCORRECT:
              // note: these cases are usually treated the same - don't tell
              // the user *why* the login failed, only that it did
              return done(null, false, {
                message: 'Invalid credentials'
              });
              break;
          case reasons.MAX_ATTEMPTS:
              // send email or otherwise notify user that account is
              // temporarily locked
              // @todo email user about account lock
              return done(null, false, {
                message: 'Invalid credentials'
              });
              break;
      }
      console.log('no reason');
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = function(app, database) {
  app.protect = protect(app);
  require('./models/User').initialise(database)

  var nunjucksEnvironment = app.get('nunjucksEnvironment');
  nunjucksEnvironment.loaders.push(new nunjucks.FileSystemLoader(path.resolve(path.join(__dirname, 'views'))));

  controllerLoader.load(path.resolve(path.join(__dirname, 'controllers')), function(controller) {
    require(controller)({
      app: app
    });
  });

  app.use(passport.initialize());
  app.use(authentication);
  app.use('/duffel-auth', express.static(__dirname + '/../public'));
}
