var redirectCookie = require('./cookie.js');

function findRedirectUri(req, res, app) {
  var redirectUri = redirectCookie.parseRedirect(req, res);
  if (redirectUri) {
    return redirectUri;
  }
  redirectUri = app.get('redirectUrl');
  if (!redirectUri) {
    return '/';
  }
  if (typeof redirectUri == 'function') {
    return redirectUri(req, res, app);
  }
  return redirectUrl;
}
module.exports = function(req, res, app) {
  return findRedirectUri(req, res, app);
};
