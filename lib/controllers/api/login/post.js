var passport = require('passport'),
  redirect = require('../../../functions/redirect');

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Process login form
   */
  app.post('/duffel-auth/api/login', function(req, res, next) {
    passport.authenticate('local', function(error, user, info) {
      if (error) {
        return next(error);
      }
      if (!user) {
        res.status(401);
        return res.format({
          html: function() {
            res.render('/errors/401.html');
          },
          json: function() {
            res.json({
              error: 'Invalid credentials',
              info: info
            });
          }
        });
      }
      req.login(user, function(error) {
        if (error) {
          throw error;
        }
        req.flash('success', 'You have been logged in');
        res.format({
          html: function() {
            return res.redirect(redirect(req, res, app));
          },
          json: function() {
            res.json({
              id: user.id,
              email: user.email,
              name: user.name
            });
          }
        });
      });
    })(req, res, next);
  });
};

