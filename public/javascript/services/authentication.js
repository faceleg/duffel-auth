'use strict';
(function() {
  var currentUser = false;
  angular.module('authentication', ['user'])

    .factory('authenticationService', [
      'User', '$rootScope', '$http', '$timeout', function(User, $rootScope, $http, $timeout) {
      var loggedIn = false;

      var POLL_FREQUENCY = 5 * 60 * 1000;
      var checkLoginState = function() {
        $http.head('/duffel-auth/api/login-state')
          .success(function() {
            $timeout(checkLoginState, POLL_FREQUENCY);
          });
      }

      if (!currentUser) {
        currentUser = User.current(function() {
          loggedIn = true;
          $rootScope.$broadcast('event:auth-loginConfirmed', currentUser);
          $timeout(checkLoginState, POLL_FREQUENCY);
        });
      }

      $rootScope.$on('event:auth-loginRequired', function() {
        currentUser = false;
      });

      return {
        currentUser: function() {
          return currentUser;
        },
        isLoggedIn: function() {
          return loggedIn;
        },
        login: function(credentials, error) {
          currentUser = User.login(credentials, error);
        }
      };
    }])

    /**
    * $http interceptor.
    * On 401 response  broadcasts 'event:auth-loginRequired'.
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
})();
