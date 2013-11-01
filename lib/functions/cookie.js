var REDIRECT_COOKIE = 'duffel-auth-redirect';
/**
 * Set 'duffel-auth-redirect' cookie with a URI to redirect to when the visitor
 * logs in. If a redirect cookie already exists, no action is taken.
 *
 * @param {Strinng} uri URI to redirect the visitor to if they login within the
 *                      next 10 minutes
 * @param {Object} res The Express response object
 */
function redirectAfterLogin(uri, req, res) {
  if (req.cookies[REDIRECT_COOKIE]) {
    return false;
  }
  res.cookie(REDIRECT_COOKIE, uri);
}

/**
 * Read the REDIRECT_COOKIE cookie's value and return it.
 *
 * @param {Object} req The Express request object
 * @return {[String]} The URI to redirect to
 */
function parseRedirect(req, res) {
  var redirectCookie = req.cookies[REDIRECT_COOKIE];
  if (!redirectCookie) {
    return null;
  }
  res.clearCookie(REDIRECT_COOKIE);
  return redirectCookie;
}

module.exports = {
  redirectAfterLogin: redirectAfterLogin,
  parseRedirect: parseRedirect
}
