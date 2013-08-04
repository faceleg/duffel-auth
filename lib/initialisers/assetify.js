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
        file: path.join(__dirname, '/../../public/javascript/applications/reset-password/application.js'),
        profile: 'duffel-auth-reset-password'
      },
    ]
  });
};