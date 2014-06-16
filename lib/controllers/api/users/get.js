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

    var page = req.query.page,
      count = req.query.count,
      sorting = req.query.sorting || {},
      filter = req.query.filter || {};

    Object.keys(sorting).forEach(function(key) {
      sorting[key] = sorting[key] == 'asc' ? 1 : -1;
    });

    Object.keys(filter).forEach(function(key) {
      filter[key] = '/' + filter[key] + '/';
    });

    User.find({
      status: {
        '$ne': User.statuses.DELETED
      }
    })
    .where(filter)
    .skip((page - 1) * count)
    .limit(count)
    .sort(sorting)
    .exec(function(error, users) {
      if (error) throw error;
      res.json(UserFormatter.list(users));
    });
  });
};
