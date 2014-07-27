var User = require('duffel-auth').User(),
  userForms = require('../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.post('/users/admin/:id', 'manage-users', function(req, res, next) {
    if (req.params.id == 'create') {
      return next();
    }
    User.find(req.params.id).then(function(user) {
      if (!user) {
        res.status(404);
        return res.render('/errors/404.html');
      }

      var form = userForms.edit(req.user);

      form.handle(req, {
        success: function (form) {

          user.email = form.data.email;
          user.super = form.data.super;
          user.status = form.data.status;
          user.confirmed = form.data.confirmed;

          if (form.data.password) {
            user.password = form.data.password;
          }

          user.save().then(function() {
            var permissions = req.body.permissions;
            if (permissions) {
              if (typeof permissions == 'string') {
                permissions = [permissions];
              }
            }

            user.updatePermissions(permissions);

            req.flash('success', 'User <a href="/users/admin/' + user._id + '">' + user.email + '</a> was updated successfully');
            return res.redirect('/users/admin');
          }, function() {
            console.log(arguments);
          });
        },
        error: function (form) {
          console.log('form error');
          return res.render('/duffel-auth/admin/users/edit.nunjucks', {
            form: form,
            editingUser: user
          });
        },
        empty: function (form) {
          console.log('form empty');
          // there was no form data in the request
          return res.render('/duffel-auth/admin/users/edit.nunjucks', {
            form: form.bind(user),
            editingUser: user
          });
        }
      });

    });
  });
};
