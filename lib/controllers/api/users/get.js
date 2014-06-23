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

    var order = [];
    Object.keys(sorting).forEach(function(key) {
      order.push(key + ' ' + (sorting[key] == 'asc' ? 'ASC' : 'DESC'));
    });

    var where = {
      status: {
        neq: 'Deleted'
      }
    };

    Object.keys(filter).forEach(function(key) {
      where[key] = {
        like: filter[key]
      };
    });

    var params = {
      where: where,
      order: order.join(', '),
      limit:count,
      skip: (page - 1) * count
    };

    User.all(params, function(error, users) {
      if (error) throw error;
      User.count(where, function(error, count) {
        if (error) throw error;
        res.json({
          total: count,
          result: UserFormatter.list(users)
        });
      });
    });
  });
};
