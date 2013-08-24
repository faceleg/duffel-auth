module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/users/admin', 'view-users', function(req, res){
    res.render('/duffel-auth/admin/users/index.html');
  });
}
