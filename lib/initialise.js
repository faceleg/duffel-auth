var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  path = require('path'),
  express = require('express'),
  controllerLoader = require('controller-loader'),
  MongoStore = require('connect-mongo')(express),
  authentication = require('./middleware/authentication'),
  nunjucks = require('nunjucks'),
  permission = require('./middleware/permission'),
  User = require('./models/User.js');

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getAuthenticated(username, password, function(err, user, reason) {
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

module.exports = function(app, options) {
  var nunjucksEnvironment = app.get('nunjucksEnvironment');
  nunjucksEnvironment.loaders.push(new nunjucks.FileSystemLoader(path.resolve(path.join(__dirname, 'views'))));

  controllerLoader.load(path.resolve(path.join(__dirname, 'controllers')), function(controller) {
    require(controller)({
      app: app
    });
  });

  app.use(express.cookieParser());
  app.use(express.session({
    secret: options.secret,
    store: new MongoStore({
      db: options.db
    })
  }));
  app.use(passport.initialize());
  app.use(permission);
  app.use(authentication);
  app.use('/duffel-auth', express.static(__dirname + '/../public'));
}
