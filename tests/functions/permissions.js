var should = require('should'),
  rewire = require('rewire'),
  permissionsFunctions = rewire('../../lib/functions/permissions');

/**
 * @return {Object} The _permissions object
 */
getPermissions = function() {
  return permissionsFunctions.__get__('_permissions');
}

/**
 * Clear the permissions object between each test.
 */
beforeEach(function clearPermissions() {
  Object.keys(getPermissions()).forEach(function(key) {
    delete getPermissions()[key];
  });
});

describe('permissions', function() {

  describe('#addPermission(uri, verb, permission)', function() {
    it('should accept three string arguments', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');
    });

    it('should convert verb to lower case', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');

      getPermissions()['/test/uri'].should.have.property('get');
    });

    it('should apply the given arguments to the permissions object appropriately', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');

      getPermissions().should.have.type('object')
        .with.property('/test/uri')
        .with.property('get', 'test-permission')

    });
  });

  describe('#_permissions', function() {
    it('should be initially empty', function() {

      getPermissions().should.have.type('object')
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

    it('should convert verb to lower case', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'GET').should.contain('login-and-more');
    });

    it('should return an empty array if no permissions were found', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'del').should.be.empty;
    });
  });

  describe('#generateSimplePermissions', function() {

      permissionsFunctions.addPermission('/protected', 'GET', 'login');
      permissionsFunctions.addPermission('/protected/further', 'GET', 'login-and-more');
      permissionsFunctions.addPermission('/protected/further', 'PUT', 'login-and-put');
      permissionsFunctions.addPermission('/protected/further/deeper', 'GET', 'rabbit-hole');

      console.log(permissionsFunctions.__get__('generateSimplePermissions')());

  })

});
