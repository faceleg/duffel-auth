var userHasPermission = require('../functions/permissions');

/**
 * Check permissions for this route.
 *
 * If login is not required (no permission or loginRequired not explicitly set):
 *  - Proceed
 *
 * If no user is logged in (and either login is required or a permission is
 * set):
 *  - Redirect to login page
 *
 * If a permission has been set and the user does not have it:
 *  - Trigger a 403
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  if (!req.loginRequired) {
    return next();
  }
  if (!req.user) {
    return res.redirect('/login');
  }
  if (!userHasPermission(req.user, req.permission)) {
    res.error(403);
  }
  next();
}
