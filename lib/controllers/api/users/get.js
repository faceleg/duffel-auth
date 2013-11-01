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

  /**
   * Fetch and output the current user.
   *
   * @permission login
   */
  app.protect.get('/duffel-auth/api/users-current', 'login', function(req, res){
    res.json(UserFormatter.single(new User(req.user)));
  });
};
