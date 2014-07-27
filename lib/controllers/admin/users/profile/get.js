var User = require('duffel-auth').User(),
  userForms = require('../../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/users/admin/profile', 'view-profile', function(req, res){

    req.user.permissions(true).then(function(permissions) {
      var permissionNames = [];
      permissions.forEach(function(permission) {
        permissionNames.push(permission.permission);
      });
      res.render('/duffel-auth/admin/users/edit.nunjucks', {
        form: userForms.edit(req.user).bind({
          email: req.user.email,
          confirmed: req.user.confirmed,
          permissions: permissionNames,
          super: req.user.super,
          status: req.user.status
        }),
        editingUser: req.user
      });
    });
  });
};
