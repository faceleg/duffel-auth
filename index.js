var connect = require('connect');

var permissions = {
  ''
}
// add permission first, then authorisation.
// declare permissions like:
{
  route: '/abc',
  login: true,
  permission: 'some-permission'
}

module.exports = {
  addPermission: require('./functions/permissions.js').addPermission,
  permission: require('./middleware/permission'),
  authorise: require('./middleware/authentication.js')
}
