//{
//  '/dashboard': {
//    '*': {
//      loginRequired: true
//      children: {
//        '/settings': {
//          'post': {
//            permission: 'modify-settings'
//          },
//          '*': {
//            permission: 'access-settings'
//          }
//        }
//      }
//    }
//  }
//}

/**
 * @param {Object} permissionTree The permission tree.
 */
var permissionTree = {};

/**
 * Find the permission representing the given uri and verb in the tree.
 *
 * @param {String} uri The URI representing the resource.
 * @param {String} verb The HTTP verb.
 * @return {Object|null}
 */
var lookupPermission = function(uri, verb) {
  console.log(__dirname);
}

module.exports = {
  /**
   * Add the given permission to the appropriate place on the permission tree.
   *
   * @param {Object} permission The permission object.
   * @param {String} permission.uri The URI representing the resource to protect.
   * @param {String} permission.verb The verb representing the resource to protect.
   * @param {Boolean} [permission.loginRequired=false] True if the user must be
   *                  logged in to access this resource.
   * @param {String} [permission.permission] The named permission required to access
   *                  this resource, implies permission.loginRequired = true.
   */
  addPermission: function(permission) {
    console.log(__dirname)
  },

  /**
   * Check whether the given user has permission to access the given URI using
   * the given HTTP verb.
   *
   * @param {Object} user The logged in user.
   * @param {String} uri The URI to be checked.
   * @param {String|*} verb The verb to be used, defaults to any.
   * @return {Boolean} True if the user is allowed to access the resource, false
   *                  otherwise.
   */
  userHasPermission: function(user, uri, verb) {
    verb = verb | '*';
    var permission = lookupPermission(uri, verb);
    if (!permission) {
      return true;
    }
  }
}
