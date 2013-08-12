'use strict';

angular.module('authentication', ['user'])

  .factory('authenticationService', ['User', '$rootScope', '$http', function(User, $rootScope, $http) {
    var loggedIn = false;

    var POLL_FREQUENCY = 5 * 60 * 1000;
    var checkLoginState = function() {
      $http.head('/api/login-state')
        .success(function() {
          $timeout(checkLoginState, POLL_FREQUENCY);
        });
    }

    var currentUser = User.current(function() {
      loggedIn = true;
      $rootScope.$broadcast('event:auth-loginConfirmed', currentUser);
      $timeout(checkLoginState, POLL_FREQUENCY);
    });

    return {
      currentUser: function() {
        return currentUser;
      },
      isLoggedIn: function() {
        return loggedIn;
      }
    };
  }])

  /**
   * $http interceptor.
   * On 401 response  broadcasts 'event:angular-auth-loginRequired'.
   */
  .config(['$httpProvider', function($httpProvider) {

    var interceptor = ['$rootScope', '$q', function($rootScope, $q) {
      function success(response) {
        return response;
      }

      function error(response) {
        if (response.status === 401) {
          $rootScope.$broadcast('event:auth-loginRequired');
        }
        return $q.reject(response);
      }

      return function(promise) {
        return promise.then(success, error);
      };

    }];
    $httpProvider.responseInterceptors.push(interceptor);
  }]);

