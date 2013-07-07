var permissions = {};

module.exports = {
  permissions: permissions,

  /**
   * Add the given permission to the appropriate place on the permission tree.
   *
   * @param {String} uri The URI representing the resource to protect.
   * @param {String} verb The verb representing the resource to protect.
   * @param {String} permission The permission object.
   */
  addPermission: function(uri, verb, permission) {
    if (!permissions[uri]) {
      permissions[uri] = {};
    }
    permissions[uri][verb] = permission;
  },

  /**
   * Find the permissions representing the given uri and verb in the tree.
   *
   * @param {String} uri The URI to be checked.
   * @param {String|*} verb The verb to be used, defaults to any.
   * @return {Object|null} The permission object or null
   */
  lookupPermissions: function(uri, verb) {
    var uriSegments = uri.replace(/^\/|\/$/g, '').split('/')
    var uriPermissions = [];
    var concatUri = '';
    uriSegments.forEach(function(segment) {
      concatUri += '/' + segment;
      if (!permissions[concatUri]) {
        return;
      }
      if (!permissions[concatUri][verb]) {
        return;
      }
      uriPermissions.push(permissions[concatUri][verb]);
    });
    return uriPermissions;
  }
}
