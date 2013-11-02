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

    it('should convert verb to upper case', function() {

      permissionsFunctions.addPermission('/test/uri', 'get', 'test-permission');

      permissionsFunctions.permissions['/test/uri'].should.have.property('GET');
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

  describe('#lookupPermissions', function() {

    beforeEach(function primePermissions() {
      permissionsFunctions.addPermission('/protected', 'GET', 'login');
      permissionsFunctions.addPermission('/protected/further', 'GET', 'login-and-more');
      permissionsFunctions.addPermission('/protected/further', 'PUT', 'login-and-put');
      permissionsFunctions.addPermission('/protected/further/deeper', 'GET', 'rabbit-hole');
    });

    it('should find the permission representing the given uri and verb in the tree', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'GET').should.contain('login-and-more');
    });

    it('should convert verb to upper case', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'get').should.contain('login-and-more');
    });

    it('should return an empty array if no permissions were found', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'del').should.be.empty;
    });
  });

});
