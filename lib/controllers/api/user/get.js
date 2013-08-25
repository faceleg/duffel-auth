var User = require('duffel-auth').User(),
  UserFormatter = require('duffel-auth').UserFormatter;

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * List users.
   *
   * @permission: view-users
   */
  app.protect.get('/duffel-auth/api/users', 'view-users', function(req, res){
    User.find({ status: { '$ne': User.statuses.DELETED }}, function(error, users) {
      if (error) throw error;
      res.json(UserFormatter.list(users));
    })
  });
};
