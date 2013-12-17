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

  var redirectUrl = req.app.get('redirectUrl');
  redirectCookie.redirectAfterLogin(redirectUrl() || req.path, req, res);

  var error = new Error('Permission denied');
  error.status = 401;
  next(error);
};
