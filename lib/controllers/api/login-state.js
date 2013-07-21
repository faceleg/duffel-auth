module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/api/login-state', 'login', function(req, res){
    res.send();
  });
  app.protect.head('/api/login-state', function(req, res){
    res.send();
  });
}
