module.exports = function(parameters) {
  var app = parameters.app;

  app.get('/logout', function(req, res){
    req.logout();
    req.flash('info', 'You have been logged out');
    res.redirect('/');
  });
}
