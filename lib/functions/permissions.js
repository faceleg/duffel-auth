var _permissions = {},
  error = require('tea-error'),
  __ = require('underscore');

/**
 * Create an array of uri: uri.split('/') objects
 *
 * @return {Object[]}
 */
function _splitPermissionUris(permissions) {

  var splitPermissionUris = [];

  Object.keys(permissions).forEach(function(key) {
    splitPermissionUris.push({
      uri: key,
      splitUri: key.split('/').filter(function(element) {
        return element;
      })
    });
  });

  return splitPermissionUris;
}

/**
  * Add the given permission to the appropriate place on the permission tree.
  *
  * @throws {PermissionCollissionError} If the uri already has a permission set
  *                                     for the given verb.
  * @throws {InvalidArgumentError} If no or invalid arguments are supplied.
  *
  * @param {String} uri The URI representing the resource to protect.
  * @param {String} verb The verb representing the resource to protect.
  * @param {String} permission The permission object.
  */
function addPermission(uri, verb, permission) {

  if (arguments.length !== 3) {
    throw new error('InvalidArgumentError')('Requires uri, verb and permission');
  }

  var invalidArguments = __.reject(arguments, function(argument) {
    return typeof(argument) === 'string' || argument instanceof String;
  });

  if (invalidArguments.length) {
    throw new error('InvalidArgumentError')('All arguments must be Strings');
  }

  if (!_permissions[uri]) {
    _permissions[uri] = {};
  }
  if (_permissions[uri][verb.toLowerCase()]) {
    throw new error('PermissionCollissionError')(verb.toUpperCase() + ' ' + uri + ' has the permission: "' +
                                                 _permissions[uri][verb.toLowerCase()] + ' set already');
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
 * @param permissions {Object}
 * @param permissionUris {String[]}
 *
 * @return {Object[]}
 */
function generateReducedPermissionUris(permissions, permissionUris) {
  var reducedPermissionUris = [],
    addedToReducedPermissionUris = {};

  permissionUris.forEach(function(uri) {
    var permission = permissions[uri];

    Object.keys(permission).forEach(function(verb) {

      if (!addedToReducedPermissionUris[permission[verb]] &&
          reducedPermissionUris.indexOf(uri) === -1) {

        reducedPermissionUris.push(uri);
        addedToReducedPermissionUris[permission] = permission[verb];
      }
    });
  });

  return reducedPermissionUris;
}

/**
 * Generate a flat permission tree, with child permissions referencing their
 * parent uri.

 * @return {Object[]} The flat permission tree.
 */
function flatPermissionTree() {

  var permissionUris = __.sortBy(Object.keys(_permissions), 'length');

  var permissionEntries = [],
    permissionUrisReversed = permissionUris.reverse();

  var reducedPermissionUris = generateReducedPermissionUris(_permissions, permissionUris);

  reducedPermissionUris.forEach(function(uri) {

    var parentUri = __.find(permissionUrisReversed, function(possibleParentUri) {
      return uri != possibleParentUri && uri.indexOf(possibleParentUri) === 0;
    });

    var permission = _permissions[uri];
    var permissionEntry = {
      uri: uri,
      permissions: permission
    };

    if (parentUri) {
      permissionEntry.parent = parentUri;
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

  var permissionEntries = _permissions;

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
  flatPermissionTree: flatPermissionTree,
  permissionTree: permissionTree
};
