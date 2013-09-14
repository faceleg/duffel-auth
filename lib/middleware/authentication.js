var passport = require('passport'),
  redirectCookie = require('../functions/cookie'),
  permissions = require('../functions/permissions');

var verifyPermissions = function(user, req, res) {
  var uriPermissions = permissions.lookupPermissions(req.url, req.method.toLowerCase());
  if (uriPermissions.length && !user) {
    return false;
  }
  if (user.super) {
    return true;
  }
  var hasPermission = uriPermissions.every(function(permission) {
    if (!user.hasPermission(permission)) {
      return false;
    }
    return true;
  });
  if (!hasPermission) {
    return false;
  }
  return true;
};

/**
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  var uriPermissions = permissions.lookupPermissions(req.url, req.method.toLowerCase());
  if (!uriPermissions.length) {
    return next();
  }
  if (req.user && verifyPermissions(req.user, req, res)) {
    return next();
  }
  redirectCookie.redirectAfterLogin(req.path, req, res);
  res.status(401);
  if (req.method == 'HEAD') {
    return res.end();
  }
  res.render('errors/401.html');
}
