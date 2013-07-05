var controllers = function(parameters) {
  var app = parameters.app;
  app.get('/login', function(req, res){
    if (req.user) {
      return res.redirect('/dashboard');
    }
    res.render('login.html');
  });
}
