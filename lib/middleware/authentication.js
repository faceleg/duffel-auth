var passport = require('passport'),
  permissions = require('../functions/permissions');

var verifyPermissions = function(user, req, res) {
  var uriPermissions = permissions.lookupPermissions(req.url, req.method.toLowerCase());
  if (uriPermissions.length && !user) {
    return false;
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
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  var uriPermissions = permissions.lookupPermissions(req.url, req.method.toLowerCase());
  if (!uriPermissions.length) {
    return next();
  }
  if (!req.user) {
    res.status(401);
    return res.render('errors/401.html');
  }
  if (!verifyPermissions(req.user, req, res)) {
    res.status(401);
    return res.render('errors/401.html');
  }
  next();
}
