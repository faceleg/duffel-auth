var User = require('duffel-auth').User(),
userForms = require('../../../../models/forms/user');

module.exports = function(parameters) {
  var app = parameters.app;

  var createForm = function createForm(currentUser) {
    return ;
  };

  app.protect.get('/users/admin/create', 'manage-users', function(req, res) {
    res.render('/duffel-auth/admin/users/create.nunjucks', {
      form: userForms.create(req.user).bind(new User()),
      title: 'Create User'
    });
  });

};
