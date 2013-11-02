var should = require('should'),
  permissionsFunctions = require('../../lib/functions/permissions');


/**
 * Clear the permissions object between each test.
 */
beforeEach(function clearPermissions() {
  Object.keys(permissionsFunctions.permissions).forEach(function(key) {
    delete permissionsFunctions.permissions[key];
  });
});

describe('permissions', function() {


  describe('#addPermission(uri, verb, permission)', function() {
    it('should accept three string arguments', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');

    });

    it('should apply the given arguments to the permissions object appropriately', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');

      permissionsFunctions.permissions.should.have.type('object')
        .with.property('/test/uri')
        .with.property('GET', 'test-permission')

    });
  });

  describe('#permissions', function() {

    it('should be initially empty', function() {
      permissionsFunctions.permissions.should.have.type('object')
        .and.be.empty;

    });

  });

});
