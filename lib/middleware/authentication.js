var passport = require('passport'),
  permissions = require('../functions/permissions');

var verifyPermissions = function(user, req, res, next) {
  var uriPermissions = permissions.lookupPermissions(req.url, req.method.toLowerCase());
  if (uriPermissions && !user) {
    res.status(401);
    return res.render('errors/401.html');
  }
  var hasPermission = true;
  uriPermissions.every(function(permission) {
    if (!user.hasPermission(permission)) {
      return false;
    }
    return true;
  });
  if (!hasPermission) {
    res.status(401);
    return res.render('errors/401.html');
  }
  return next();
};

/**
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  passport.authenticate('local', function(error, user, info) {
    if (error) {
      return next(error);
    }
    if (!user) {
      return verifyPermissions(user, req, res, next);
    }
    req.logIn(user, function(error) {
      if (error) {
        return next(error);
      }
      return verifyPermissions(user, req, res, next);
    });
  })(req, res, next);
}
