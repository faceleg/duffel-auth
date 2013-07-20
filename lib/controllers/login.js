var passport = require('passport'),
  redirect = require('../functions/redirect');

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Show the login form.
   */
  app.get('/login', function(req, res){
    if (req.user) {
      return res.redirect(redirect(req, app));
    }
    res.render('duffel-atuh/login.html');
  });

  /**
   * Process login form
   */
  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(error, user, info) {
      if (error) {
        throw error
        return next(error);
      }
      if (!user) {
        res.status(401);
        return res.format({
          html: function() {
            res.render('errors/401.html');
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
        req.user = user;
        req.flash('success', 'You have been logged in');
        return res.redirect(redirect(req, app));
      });
    })(req, res, next);
  });
}
