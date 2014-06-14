var path = require('path');

module.exports = function(app) {
  var assetManager = app.get('assetManager');
  if (!assetManager) {
    return;
  }

  assetManager.addFiles({
    profile: 'login-form',
    after: ['angular', 'angular-cookies'],
    before: 'angular-bootstrap',
    js: [
      path.join(__dirname, '/../../public/javascript/applications/login/application.js'),
      path.join(__dirname, '/../../public/javascript/applications/login/controllers.js'),
    ]
  });

  assetManager.addFiles({
    profile: 'core-logged-in',
    after: 'angular-resource',
    js: [
      path.join(__dirname, '/../../public/javascript/resources/user.js'),
      path.join(__dirname, '/../../public/javascript/services/authentication.js'),
      path.join(__dirname, '/../../public/javascript/applications/reauthentication/application.js'),
      path.join(__dirname, '/../../public/javascript/applications/reauthentication/controllers.js'),
      path.join(__dirname, '/../../public/javascript/applications/reauthentication/bootstrap.js'),

      // Forgot password
      {
        file: path.join(__dirname, '/../../public/javascript/applications/forgot-password/application.js'),
        profile: 'duffel-auth-forgot-password'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/forgot-password/controllers.js'),
        profile: 'duffel-auth-forgot-password'
      },

      // Reset password
      {
        file: path.join(__dirname, '/../../public/javascript/applications/reset-password/application.js'),
        profile: 'duffel-auth-reset-password'
      },
      {
        file: path.join(__dirname, '/../../public/javascript/applications/reset-password/controllers.js'),
        profile: 'duffel-auth-reset-password'
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
