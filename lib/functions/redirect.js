var redirectCookie = require('./cookie.js');

function findRedirectUri(req, res, app) {
  var redirectUri = app.get('redirectUri') || false;
  if (redirectUri) {
    return redirectUri;
  }
  redirectUri = redirectCookie.parseRedirect(req, res);
  if (!redirectUri) {
    return '/';
  }
  if (typeof redirectUri == 'function') {
    return redirectUri(req, res, app);
  }
  return redirectUri;
}

module.exports = function(req, res, app) {
  return findRedirectUri(req, res, app);
};
