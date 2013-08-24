var path = require('path');

module.exports = function(app) {
  var assetify = app.get('assetify');
  if (!assetify) {
    return;
  }
  assetify.addFiles({
    js: [
      {
        file: path.join(__dirname, '/../../public/javascript/resources/user.js'),
        profile: 'core-logged-in'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/services/authentication.js'),
        profile: 'core-logged-in'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/reauthentication/application.js'),
        profile: 'core-logged-in'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/reauthentication/controllers.js'),
        profile: 'core-logged-in'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/reauthentication/bootstrap.js'),
        profile: 'core-logged-in'
      },
      {
        name: 'duffel-ngtable',
        file: '/bower/duffel-ngtable/directives/duffel-ngtable.js',
        profile: 'core-logged-in'
      },
      {
        name: 'ngcompile',
        file: '/bower/ngcompile/directives/ngcompile.js',
        profile: 'core-logged-in'
      },

      // Reset password
      {
        file: path.join(__dirname, '/../../public/javascript/applications/reset-password/application.js'),
        profile: 'duffel-auth-reset-password'
      },

      // Login form
      {
        file: path.join(__dirname, '/../../public/javascript/applications/login/application.js'),
        profile: 'login-form'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/login/controllers.js'),
        profile: 'login-form'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/resources/user.js'),
        profile: 'core'
      },

      // Administration
      {
        file: path.join(__dirname, '/../../public/javascript/applications/admin/users/application.js'),
        profile: 'duffel-auth-admin'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/admin/users/controllers.js'),
        profile: 'duffel-auth-admin'
      }
    ]
  });
};
