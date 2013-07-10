module.exports = {
  addPermission: require('./lib/functions/permissions').addPermission,
  initialise: require('./lib/initialise'),
  User: require('./lib/models/User').model,
  UserSchema: require('./lib/models/User').schema
}
