module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Log user out and redirect them to the home page.
   */
  app.get('/logout', function(req, res){
    req.logout();
    req.flash('info', 'You have been logged out');
    res.redirect('/');
  });
}
