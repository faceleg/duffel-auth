var permissions = {},
  __ = require('underscore'),
  _splitPermissionUris = null;

function createSplitPermissionUris() {
  if (!_splitPermissionUris) {
    _splitPermissionUris = [];
    Object.keys(permissions).forEach(function(key) {
      _splitPermissionUris.push({
        uri: key,
        splitUri: key.split('/').filter(function(element) {
          return element;
        })
      });
    })
  }
  return _splitPermissionUris;
}

function lookupPermissions(uri, verb) {
  var uriSegments = uri.replace(/^\/|\/$/g, '').split('/'),
    matchedPermissions = [],
    splitPermissionUris = createSplitPermissionUris();

  splitPermissionUris.forEach(function(splitPermission) {
    if (splitPermission.splitUri.length > uriSegments.length) {
      return;
    }

    var possibleMatch = true;
    splitPermission.splitUri.forEach(function(permissionUri, permissionUriIndex) {
      var uriSegment = uriSegments[permissionUriIndex];
      if (permissionUri.charAt(0) === ':') {
        return;
      }
      if (permissionUri !== uriSegment) {
        possibleMatch = false;
      }
    });
    if (possibleMatch) {

      var permission = permissions[splitPermission.uri];

      // Add permission onnly if it has not yet been added
      if (permission[verb] && matchedPermissions.indexOf(permission[verb]) == -1) {
        matchedPermissions.push(permission[verb]);
      }
    }
  });

  return matchedPermissions;
}

function generateSimplePermissions() {
  // Convert permission map into a simpler { uri: permission } format
  var simplePermissions = {};

  __.sortBy(Object.keys(permissions), 'length').forEach(function(permissionUri) {
    var p = permissions[permissionUri];
    var permission = p.get || p.post || p.put || p.del || p.head;
    simplePermissions[permissionUri] = permission;
  });

  return simplePermissions;
}

/**
 * Reduce permission uris such that only the shortest URI with a given
 * permission remains
 *
 * @param simplePermissions {Object}
 * @param permissionUris {Object[]}
 *
 * @return {String[]}
 */

function generateReducedPermissionUris(simplePermissions, permissionUris) {
  var reducedPermissionUris = [],
    addedToReducedPermissionUris = {};

  permissionUris.forEach(function(uri) {
    var permission = simplePermissions[uri];
    if (!addedToReducedPermissionUris[permission]) {
      reducedPermissionUris.push(uri);
      addedToReducedPermissionUris[permission] = permission;
    }
  });
  return reducedPermissionUris;
}

/**
 * Create a permission entry with the permission's parent if it is not a
 * root permission, add entry to permission entry array
 *
 * @param simplePermissions {Object}
 * @param reducedPermissionUris {String[]}
 *
 * @return {Object[]}
 */

function generatePermissionEntries() {

  var simplePermissions = generateSimplePermissions();
  var permissionUris = __.sortBy(Object.keys(simplePermissions), 'length')

  var permissionEntries = [],
    permissionUrisReversed = permissionUris.reverse();

  var reducedPermissionUris = generateReducedPermissionUris(simplePermissions, permissionUris);

  reducedPermissionUris.forEach(function(uri) {
    var parentUri = __.find(permissionUrisReversed, function(possibleParentUri) {
      return uri != possibleParentUri && uri.indexOf(possibleParentUri) === 0;
    });

    var permission = simplePermissions[uri];
    var permissionEntry = {
      name: permission
    };
    if (parentUri) {
      permissionEntry.parent = simplePermissions[parentUri];
    }
    permissionEntries.push(permissionEntry);
  });

  return permissionEntries;
}

function permissionTree() {
  var permissionEntries = generatePermissionEntries();

  // Add children to their parents
  permissionEntries.forEach(function(permissionEntry) {
    if (permissionEntry.parent) {
      var parent = __.find(permissionEntries, function(entry) {
        return entry.name == permissionEntry.parent;
      });
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(permissionEntry);
    }
  });

  // Return array of root permissions
  return __.filter(permissionEntries, function(entry) {
    return !entry.parent;
  });
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

    if (arguments.length !== 3) {
      throw new Error('Requires uri, verb and permission');
    }

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
  lookupPermissions: lookupPermissions,

  simplePermissions: generatePermissionEntries,

  /**
   * Convert the permission map into a permission tree based on the permission
   * map's URI structure.
   *
   * @return {Object[]}
   */
  permissionTree: permissionTree
}
