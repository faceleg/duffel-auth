var User = require('duffel-auth').User(),
  userForms = require('../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.post('/users/admin/user/:id', 'manage-users', function(req, res){
    User.findById(req.params.id, function(error, user) {
      if (error) throw error;
      if (!user) {
        res.status(404);
        return res.render('/errors/404.html');
      }
      var form = userForms.edit(req.user);
      form.handle(req, {
        success: function (form) {
          // there is a request and the form is valid
          // form.data contains the submitted data
          console.log(form.data);
          user.update(form.data, function(error) {
            if (error) throw error;
            req.flash('success', 'User <a href="/users/admin/user/' + user._id + '">' + user.email + '</a> was updated successfully');
            return res.redirect('/users/admin');
          });
        },
        error: function (form) {
          // the data in the request didn't validate,
          // calling form.toHTML() again will render the error messages
          return res.render('/duffel-auth/admin/users/edit.html', {
            form: form
          });
        },
        empty: function (form) {
          // there was no form data in the request
          return res.render('/duffel-auth/admin/users/edit.html', {
            form: form.bind(user)
          });
        }
      });
    });
  });
};
