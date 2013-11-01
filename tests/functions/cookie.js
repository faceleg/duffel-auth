var should = require('should'),
  cookieFunctions = require('../../lib/functions/cookie');

describe('Coookie', function() {
  describe('redirect after login', function() {
    it('should call the cookie function with string arguments', function(done) {

      var mockResponse = {
        cookie: function(redirect_cookie_name, uri) {

          redirect_cookie_name.should.have.type('string');
          uri.should.have.type('string');
          done();
        }
      }

      cookieFunctions.redirectAfterLogin('/test/uri', {
        cookies: {}
      }, mockResponse);
    });

    it('should not set a cookie for redirect cookie key when a cookie has been previously set', function() {

      var testUri = '/test/uri';

      cookieFunctions.redirectAfterLogin(testUri, {
        cookies: {
          'duffel-auth-redirect': testUri
        }
      }, {}).should.be.false;

    });
  });
});
