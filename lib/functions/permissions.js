var permissions = {},
  _splitPermissionUris = null;

function createSplitPermissionUris() {
  if (!_splitPermissionUris) {
    _splitPermissionUris = [];
    Object.keys(permissions).forEach(function(key) {
      _splitPermissionUris.push({
        uri: key,
        splitUri: key.split('/').filter(function(element) { return element; })
      });
    })
  }
  return _splitPermissionUris;
}

function lookupPermissions(uri, verb) {
  var uriSegments = uri.replace(/^\/|\/$/g, '').split('/'),
    uriPermissions = [],
    splitPermissionUris = createSplitPermissionUris();

  uriSegments.forEach(function(segment, segmentIndex) {
    splitPermissionUris.forEach(function(splitPermission) {
      if (splitPermission.splitUri.length - 1 < segmentIndex) {
        return;
      }
      var splitUriSegment = splitPermission.splitUri[segmentIndex];
      if (splitUriSegment != segment && splitUriSegment.charAt(0) != ':') {
        return;
      }
      if (splitPermission.splitUri.length - 1 == segmentIndex) {
        var permission = permissions[splitPermission.uri];
        if (permission[verb] && uriPermissions.indexOf(permission[verb]) == -1) {
          uriPermissions.push(permission[verb]);
        }
      }
    });
  });

  return uriPermissions;
}

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
  lookupPermissions: lookupPermissions
}
