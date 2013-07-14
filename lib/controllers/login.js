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
    res.render('login.html');
  });

  /**
   * Process login form
   */
  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(error, user, info) {
      if (error) {
        return next(error);
      }
      req.login(user, function(error) {
        if (error) {
          return next(error);
        }
        req.user = user;
        req.flash('success', 'You have been logged in');
        return res.redirect(redirect(req, app));
      });
    })(req, res, next);
  });
}
