var User = require('../models/User'),
  passport = require('passport');

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Show the login form.
   */
  app.get('/login', function(req, res){
    if (req.user) {
      return res.redirect('/dashboard');
    }
    res.render('login.html');
  });

  /**
   * Process login form
   */
  app.post('/login', passport.authenticate('local', {
      failureFlash: true
    }), function(req, res) {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    res.format({
      html: function() {
        res.render('login.html', {
          error: 'Invalid credentials'
        });
      },
      json: function() {
        res.status(401);
        res.json({
          error: 'Invalid credentials'
        })
      }
    })
  })
}
