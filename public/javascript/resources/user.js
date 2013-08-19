angular.module('user', ['ngResource'])
  .factory('User', [
    '$resource', '$http', '$rootScope',
    function($resource, $http, $rootScope) {

    var User = $resource('/duffel-auth/api/users/:id:command', {
      id : '@id' //this binds the ID of the model to the URL
    }, {
      query: { method: 'GET', isArray: true },
      save: { method: 'PUT' },
      create: { method: 'POST' },
      destroy: { method: 'DELETE' },
      current: {
        method: 'GET',
        params: { command: 'current' }
      }
    });

    User.login = function(credentials, error) {

      var user = null;
      $http.post('/duffel-auth/api/login', credentials)
        .success(function(data) {
          user = new User(data);
          $rootScope.$broadcast('event:auth-loginConfirmed', user);
        })
        .error(error);

      return user;
    }

    return User;
}]);
