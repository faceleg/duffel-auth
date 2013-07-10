module.exports = {
  addPermission: require('./lib/functions/permissions').addPermission,
  initialise: require('./lib/initialise'),
  User: require('./models/User').model,
  UserSchema: require('./models/User').schema
}
