var User = require('duffel-auth').User(),
  userForms = require('../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.post('/users/admin/:id', 'manage-users', function(req, res){
    User.findById(req.params.id, function(error, user) {
      if (error) throw error;
      if (!user) {
        res.status(404);
        return res.render('/errors/404.html');
      }

      var form = userForms.edit(req.user);
      form.handle(req, {
        success: function (form) {

          var params = {
            email: form.data.email,
            super: form.data.super,
            status: form.data.status,
            confirmed: form.data.confirmed,
            permissions: req.body.permissions || []
          };

          if (form.data.password) {
            params.password = form.data.password;
          }

          user.update(params, function(error) {
            if (error) throw error;
            req.flash('success', 'User <a href="/users/admin/' + user._id + '">' + user.email + '</a> was updated successfully');
            return res.redirect('/users/admin');
          });
        },
        error: function (form) {
          return res.render('/duffel-auth/admin/users/edit.nunjucks', {
            form: form,
            editingUser: user
          });
        },
        empty: function (form) {
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
