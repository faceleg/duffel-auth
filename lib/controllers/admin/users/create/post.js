var User = require('duffel-auth').User(),
userForms = require('../../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.post('/users/admin/create', 'manage-users', function(req, res) {

    var form = userForms.create(req.user);
    form.handle(req, {
        success: function (form) {

          User.create({
            email: req.body.email,
            password: req.body.password,
            confirmed: req.body.confirmedi == 'on' ? true: false,
            super: req.body.super == 'on' ? true : false
          }, function(error, user) {
            var permissions = req.body.permissions;
            if (permissions) {
              if (typeof permissions == 'string') {
                permissions = [permissions];
              }
              var params = [];
              permissions.forEach(function(permission) {
                user.permissions.create({
                  permission: permission
                });
              });
            }
            req.flash('success', 'User <a href="/users/admin/user/' + user._id + '">' + user.email + '</a> was created');
            res.redirect('/users/admin');
          });
        },
        error: function (form) {
            // the data in the request didn't validate,
            // calling form.toHTML() again will render the error messages
          res.render('/duffel-auth/admin/users/create.nunjucks', {
            form: form,
            title: 'Create User'
          });
        },
        empty: function (form) {
            // there was no form data in the request

          res.render('/duffel-auth/admin/users/create.nunjucks', {
            form: form,
            title: 'Create User'
          });
        }
    });
  });
};
