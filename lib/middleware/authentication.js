var passport = require('passport'),
  async = require('async'),
  redirectCookie = require('../functions/cookie'),
  permissions = require('../functions/permissions');

var verifyPermissions = function(user, req, res, callback) {
  var uriPermissions = permissions.lookupPermissions(req.url, req.method.toLowerCase());
  if (uriPermissions.length && !user) {
    return callback(false);
  }
  if (user.super) {
    return callback(true);
  }
  async.every(uriPermissions, function(permission, callback) {
    user.hasPermission(permission).then(callback);
  }, function(hasPermission) {
      return callback(hasPermission);
  });
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

  function noPermission() {
    var redirectUrl = req.app.get('redirectUrl');
    redirectCookie.redirectAfterLogin(redirectUrl || req.path, req, res);

    var error = new Error('Permission denied');
    error.status = 401;
    next(error);
  }

  if (!req.user) {
    return noPermission();
  }

  verifyPermissions(req.user, req, res, function(hasPermission) {
    if (hasPermission) {
      return next();
    }

    noPermission();
  });

};
