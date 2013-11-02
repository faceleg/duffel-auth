var should = require('should'),
  cookieFunctions = require('../../lib/functions/cookie');

  describe('cookie', function() {

  describe('#redirectAfterLogin(uri, req, res)', function() {
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

  describe('#parseRedirect(req, res)', function() {

    it('should return the cookie\'s value if set', function() {

      var testUri = '/test/uri';
      var cookieValue = cookieFunctions.parseRedirect({
        cookies: {
          'duffel-auth-redirect': testUri
        }
      }, {
        clearCookie: function() {}
      });

      cookieValue.should.have.type('string');
      cookieValue.should.equal(testUri);

      cookieValue = cookieFunctions.parseRedirect({
        cookies: {}
      }, {
        clearCookie: function() {}
      });

      cookieValue.should.be.false;
    });

    it('should return the false if no cookie has been set', function() {

      var cookieValue = cookieFunctions.parseRedirect({
        cookies: {}
      }, {
        clearCookie: function() {}
      }).should.be.false;
    });


    it('should clear the cookie before returning it', function() {

      cookieFunctions.parseRedirect({
        cookies: {}
      }, {
        clearCookie: function(redirect_cookie_name) {
          done();
        }
      });
    });
  });
});
