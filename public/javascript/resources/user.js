angular.module('user', ['ngResource'])
  .factory('User', ['$resource', function($resource) {
    return $resource('/duffel-auth/users/:id:command', {
      id : '@id' //this binds the ID of the model to the URL
    }, {
      query: { method: 'GET', isArray: true }, //this can also be called index or all
      save: { method: 'PUT' },
      create: { method: 'POST' },
      destroy: { method: 'DELETE' },
      current: {
        method: 'GET',
        params: { command: 'current' }
      }
    });
}]);