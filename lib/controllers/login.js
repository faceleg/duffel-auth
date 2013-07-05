var User = require('../models/User');

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
   * Process login form.
   */
  app.post('/login', function(req, res) {
    console.log(req.body)
    // validate credentials
    if (loggedin) {
      return res.redirect('/dashboard');
    }
    res.render('login.html', {
      error: 'Invalid credentials'
    });
  })
}
