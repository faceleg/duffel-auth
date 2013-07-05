/**
 * Check permissions for this route and bounce non logged in users to the login
 * screen, 403 unauthorised, allowing authorised users through.
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  if (!user && req.loginRequired) {
    return res.redirect('/login');
  }
  next();
}
