module.exports = function(app) {
  var collector = app.get('visor');
  collector.add({
    'name': 'Users',
    'uri': '/users/admin',
    'permission': 'view-users'
  });
}

