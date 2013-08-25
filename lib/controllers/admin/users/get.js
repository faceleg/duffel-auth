var User = require('duffel-auth').User(),
  userForms = require('../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/users/admin', 'view-users', function(req, res){
    res.render('/duffel-auth/admin/users/index.html');
  });

  app.protect.get('/users/admin/user/:id', 'manage-users', function(req, res){
    User.findById(req.params.id, function(error, user) {
      if (error) throw error;
      if (!user) {
        res.status(404);
        return res.render('/errors/404.html');
      }

      var form = userForms.edit(req.user);
      res.render('/duffel-auth/admin/users/edit.html', {
        form: form.bind(user)
      });
    })
  });
}
