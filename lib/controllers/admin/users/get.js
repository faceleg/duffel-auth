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

    User.find(req.params.id, function(error, user) {
      if (error) throw error;
      if (!user) {
        res.status(404);
        return res.render('/errors/404.nunjucks');
      }
    }).then(function(user) {
      this.user = user;
      return user.permissions(true);
    }).then(function(permissions) {
      var permissionNames = [];
      permissions.forEach(function(permission) {
        permissionNames.push(permission.permission);
      });
      res.render('/duffel-auth/admin/users/edit.nunjucks', {
        form: userForms.edit(req.user).bind({
          email: user.email,
          confirmed: user.confirmed,
          permissions: permissionNames,
          super: user.super,
          status: user.status
        }),
        editingUser: user
      });
    });
  });
};
