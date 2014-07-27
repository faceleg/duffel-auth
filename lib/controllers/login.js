var redirect = require('../functions/redirect');

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Show the login form.
   */
  app.get('/login', function(req, res, next){
    if (app.get('disableLoginForm')) {
      return next();
    }
    if (req.user) {
      return res.redirect(redirect(req, res, app));
    }
    res.render('/duffel-auth/login.nunjucks');
  });
};
