module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/duffel-auth/api/login-state', 'login', function(req, res){
    res.send();
  });
  app.protect.head('/duffel-auth/api/login-state', function(req, res){
    res.send();
  });
}
