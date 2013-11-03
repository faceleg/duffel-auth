/* jshint expr: true */

var should = require('should'),
  rewire = require('rewire'),
  protect = rewire('../../lib/functions/protect'),
  permissionsFunctions = require('../../lib/functions/permissions');

describe('protect', function() {

 it('should throw an InvalidArgumentError when called without an argument', function() {
    (protect()).should.throw('InvalidArgumentError');
  });

  it('should return an object with a function for each REST verb', function() {
    protect({}).should.have.properties(['head', 'get', 'post', 'put', 'del']);
  });

  it('should call the relevant verb function on the given app', function(done) {

    var protector = protect({
      head: function() {
        done();
      }
    });

    protector.head('/', 'permission');
  });

  it('should apply the permissions successfully', function(done) {
    protect({
      get: function() {
        var permission = permissionsFunctions.lookupPermissions('/', 'get');
        permission.should.be.an.instanceOf(Array).with.a.length(1);
        permission.should.include('permission');
        done();
      }
    }).get('/', 'permission');

  });

  it('should call the relevant verb function with the proper arguments', function(done) {

    var protector = protect({
      get: function() {
        console.log('args: ' + arguments);
        done();
      }
    });

    protector.get('/', 'permission');
  });

  describe('#_protect', function() {

    it('should throw an InvalidArgumentError when no arguments are supplied', function() {
      (protect.__get__('_protect')()).should.throw('InvalidArgumentError');
    });

    it('should throw an InvalidArgumentError when bad arguments are supplied', function() {
      (protect.__get__('_protect')(1, 2)).should.throw('InvalidArgumentError');
      (protect.__get__('_protect')('get', 2)).should.throw('InvalidArgumentError');
    });
  });

});
