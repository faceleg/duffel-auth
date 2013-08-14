var redirect = require('../functions/redirect');

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Show the login form.
   */
  app.get('/login', function(req, res){
    if (req.user) {
      return res.redirect(redirect(req, app));
    }
    res.render('/duffel-auth/login.html');
  });
}
