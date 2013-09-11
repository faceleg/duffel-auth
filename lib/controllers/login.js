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
    var redirectUri = '/';
    if (app.get('redirectUrl')) {
      redirectUri = app.get('redirectUrl')(req.user, req, app);
    }
    res.render('/duffel-auth/login.html', {
      redirectUri: redirectUri
    });
  });
}
