var _permissions = {},
  __ = require('underscore');

/**
 * Create an array of uri: uri.split('/') objects
 *
 * @return {Object[]}
 */
function _splitPermissionUris(permissions) {

  var _splitPermissionUris = [];

  Object.keys(permissions).forEach(function(key) {
    _splitPermissionUris.push({
      uri: key,
      splitUri: key.split('/').filter(function(element) {
        return element;
      })
    });
  });

  return _splitPermissionUris;
}

/**
 * Convert raw permissions to a simpler { uri: permission } format.
 */
function _generateSimplePermissions(permissions) {

  var simplePermissions = {};

  __.sortBy(Object.keys(permissions), 'length').forEach(function(permissionUri) {
    var p = permissions[permissionUri];
    var permission = p.get || p.post || p.put || p.del || p.head;
    simplePermissions[permissionUri] = permission;
  });

  return simplePermissions;
}

/**
  * Add the given permission to the appropriate place on the permission tree.
  *
  * @param {String} uri The URI representing the resource to protect.
  * @param {String} verb The verb representing the resource to protect.
  * @param {String} permission The permission object.
  */
function addPermission(uri, verb, permission) {

  if (arguments.length !== 3) {
    throw new Error('Requires uri, verb and permission');
  }

  if (!_permissions[uri]) {
    _permissions[uri] = {};
  }
  _permissions[uri][verb.toLowerCase()] = permission;
}

/**
  * Find the permissions representing the given uri and verb in the tree.
  *
  * @param {String} uri The URI to be checked.
  * @param {String|*} verb The verb to be used, defaults to any.
  * @return {Object|null} The permission object or null
  */
function lookupPermissions(uri, verb) {

  verb = verb.toLowerCase();

  var uriSegments = uri.replace(/^\/|\/$/g, '').split('/'),
    matchedPermissions = [],
    splitPermissionUris = _splitPermissionUris(_permissions);

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

      var permission = _permissions[splitPermission.uri];

      // Add permission only if it has not yet been added
      if (permission[verb] && matchedPermissions.indexOf(permission[verb]) == -1) {
        matchedPermissions.push(permission[verb]);
      }
    }
  });

  return matchedPermissions;
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

  var simplePermissions = _generateSimplePermissions(_permissions);
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

/**
 * Convert the permission map into a permission tree based on the permission
 * map's URI structure.
 *
 * @return {Object[]}
 */
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
  addPermission: addPermission,
  lookupPermissions: lookupPermissions,
  simplePermissions: generatePermissionEntries,
  permissionTree: permissionTree
}
