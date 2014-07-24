var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  path = require('path'),
  protect = require('./functions/protect'),
  express = require('express'),
  controllerLoader = require('controller-loader'),
  nunjucks = require('nunjucks'),
  q = require('q');

var User = null;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function authenticateUser(email, password, done) {
    User.getAuthenticated(email, password, function(error, user, reason) {
      if (error) throw error;

      if (user) {
        return done(null, user);
      }

      // otherwise we can determine why we failed
      var reasons = User.failedLogin;
      switch (reason) {
        case reasons.NOT_FOUND:
          return done(null, false, {
            name: 'InvalidUserError',
            message: 'User account does not exist'
          });
        case reasons.NOT_ACTIVE:
          return done(null, false, {
            name: 'DisabledUserError',
            message: 'User account has been disabled'
          });
        case reasons.PASSWORD_INCORRECT:
          return done(null, false, {
            name: 'IncorrectPasswordError',
            message: 'Incorrect password'
          });
        case reasons.MAX_ATTEMPTS:
          // send email or otherwise notify user that account is
          // temporarily locked
          // @todo email user about account lock
          return done(null, false, {
            name: 'TooManyFailuresError',
            message: 'Too many failed attempts, account locked temporarily'
          });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  if (user) {
    return done(null, user.id);
  }
  done();
});

passport.deserializeUser(function(id, done) {
  User.find(id, function(err, user) {
    done(err, user);
  });
});

module.exports = function(app, database, callback) {
  app.protect = protect(app);

  require('./models/User').initialise(database);
  User = require('./models/User').model();

  require('../lib/initialisers/assets')(app);
  require('../lib/initialisers/visor')(app);

  app.get('nunjucksEnvironment')
    .addExtension('permission', require('../lib/nunjucks-tags/permission'));

  app.get('nunjucksEnvironment').loaders
    .push(new nunjucks.FileSystemLoader(path.join(__dirname, 'views')));

  app.after('session').use(passport.initialize()).as('passport-initialize');
  app.after('passport-initialize').use(passport.session()).as('passport-session');
  app.use('/duffel-auth', express.static(__dirname + '/../public'));
  app.after('passport-initialize').use(function(req, res, next) {

    // Create fake user if no users exist
    if (req.user) {
      return next();
    }

    User.findOne({}, function (error, user) {
      if (user) {
        return next();
      }

      req.user = {
        email: 'example@example.com',
        super: true,
        permissions: ['login'],
        hasPermission: function() {
          var deferred = q.defer();
          deferred.resolve(true);
          return deferred.promise;
        },
        save: function(data, callback) {
          callback();
        }
      };

      next();
    });
  });

  controllerLoader.load(path.resolve(path.join(__dirname, 'controllers')), function(controller) {
    require(controller)({
      app: app
    });
  }, callback);
};
