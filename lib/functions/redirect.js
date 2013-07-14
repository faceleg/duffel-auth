function findRedirectUrl(req, app) {
  var redirectUrl = app.get('redirectUrl')
  if (!redirectUrl) {
    return '/';
  }
  if (typeof redirectUrl == 'function') {
    return redirectUrl(req, app);
  }
  return redirectUrl;
}
module.exports = function(req, app) {
  return findRedirectUrl(req, app);
}
