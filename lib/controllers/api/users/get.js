var User = require('duffel-auth').User(),
  UserFormatter = require('duffel-auth').UserFormatter;

module.exports = function(parameters) {
  var app = parameters.app;

  /**
   * Fetch and output the current user.
   *
   * @permission login
   */
  app.protect.get('/duffel-auth/api/users-current', 'login', function(req, res){
    res.json(UserFormatter.single(req.user));
  });
};
