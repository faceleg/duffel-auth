module.exports = {
  initialise: require('./lib/initialise'),
  addPermission: require('./lib/functions/permissions').addPermission,
  User: function() {
    return require('./lib/models/User').model()
  }
}
