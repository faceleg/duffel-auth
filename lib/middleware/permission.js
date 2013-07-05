var permissions = require('../functions/permissions.js')
/**
 * Check for authentication details for this route, applying permissions and
 * login state requirement to the request object if necessary.
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  console.log(__filename)
  //req.loginRequired = true;
  next();
}
