module.exports = {
  addPermission: require('./lib/functions/permissions').addPermission,
  initialise: require('./lib/initialise'),
  User: function() {
    return require('./lib/models/User').model()
  }
}
