module.exports = {
  initialise: require('./lib/initialise'),
  redirectCookie: require('./lib/functions/cookie').redirectCookie,
  addPermission: require('./lib/functions/permissions').addPermission,
  permissionTree: require('./lib/functions/permissions').permissionTree,
  User: function() {
    return require('./lib/models/User').model();
  },
  UserFormatter: require('./lib/models/formatters/UserFormatter')
};
