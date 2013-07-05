var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  express = require('express'),
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

module.exports = function(app, options) {
  app.use(express.session({
    secret: options.secret
  }));
  app.use(passport.initialize());
}
