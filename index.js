module.exports = {
  initialise: require('./lib/initialise'),
  addPermission: require('./lib/functions/permissions').addPermission,
  Token: function() {
    return require('./lib/models/Token').model()
  },
  User: function() {
    return require('./lib/models/User').model()
  }
}
