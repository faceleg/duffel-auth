var passport = require('passport');

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Process login form
   */
  app.post('/duffel-auth/api/login', function(req, res, next) {
    passport.authenticate('local', function(error, user, info) {
      if (error) {
        throw error
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
              error: 'Invalid credentials'
            });
          }
        })
      }
      req.login(user, function(error) {
        if (error) {
          throw error
          return next(error);
        }
        req.flash('success', 'You have been logged in');
        res.format({
          html: function() {
            return res.redirect(redirect(req, app));
          },
          json: function() {
            res.status(200);
            res.send();
          }
        });
      });
    })(req, res, next);
  });
};

