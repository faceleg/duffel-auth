var permissions = require('./permissions.js'),
  authentication = require('../middleware/authentication'),
  error = require('tea-error');

function _protect(verb, parameters) {

  if (arguments.length < 2) {
    throw new error('InvalidArgumentError')('Requires verb, paramenters');
  }

  if (typeof verb !== 'string') {
    throw new error('InvalidArgumentError')('verb must be a string');
  }

  if (!(parameters instanceof Object) || parameters.length < 2) {
    throw new error('InvalidArgumentError')('parameters must be an array like: [/uri, permission-name]');
  }

  // Convert parameters into an array
  var args = Array.prototype.slice.call(parameters);

  var uri = args[0];
  var permission = args[1];
  permissions.addPermission(uri, verb, permission);

  // Replace permission middleware with authentication
  args[1] = authentication;

  // Add to express' routes
  return this[verb].apply(this, args);
}

module.exports = function(app) {

  if (arguments.length === 0) {
    throw new error('InvalidArgumentError')('Requires app');
  }

  return {
    head: function() {
      return _protect.call(app, 'head', arguments);
    }.bind(app),
    get: function() {
      return _protect.call(app, 'get', arguments);
    }.bind(app),
    post: function() {
      return _protect.call(app, 'post', arguments);
    }.bind(app),
    put: function() {
      return _protect.call(app, 'put', arguments);
    }.bind(app),
    del: function() {
      return _protect.call(app, 'del', arguments);
    }.bind(app)
  };
};
