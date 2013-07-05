module.exports = {
  addPermission: require('./lib/functions/permissions.js').addPermission,
  permission: require('./lib/middleware/permission'),
  authentication: require('./lib/middleware/authentication.js')
}
