module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/duffel-auth/reauthenticate', 'login', function(req, res) {
    res.render('/duffel-auth/partials/reauthenticate-dialog.html');
  });
};
