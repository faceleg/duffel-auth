var User = require('duffel-auth').User(),
  userForms = require('../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/users/admin', 'view-users', function(req, res){
    res.render('/duffel-auth/admin/users/index.nunjucks');
  });

  app.protect.get('/users/admin/:id', 'manage-users', function(req, res, next) {
    if (req.params.id == 'create') {
      return next();
    }
    User.findById(req.params.id, function(error, user) {
      if (error) throw error;
      if (!user) {
        res.status(404);
        return res.render('/errors/404.nunjucks');
      }

      res.render('/duffel-auth/admin/users/edit.nunjucks', {
        form: userForms.edit(req.user).bind(user),
        editingUser: user
      });
    });
  });
};
