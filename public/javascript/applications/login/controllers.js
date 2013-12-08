(function() {
  'use strict';

  angular.module('login.controllers', [])
    .controller('LoginController', [
      '$scope', 'User', '$window', '$cookies', '$cookieStore', function LoginController($scope, User, $window, $cookies, $cookieStore) {

    $scope.user = {};
    $scope.submitting = false;
    $scope.error = false;

    $scope.$on('event:auth-loginConfirmed', function() {
      var REDIRECT_COOKIE = 'duffel-auth-redirect',
        redirectUri = $cookies[REDIRECT_COOKIE];

      if (redirectUri) {
        $cookieStore.remove(REDIRECT_COOKIE);
        $window.location.href = redirectUri;
        return;
      }
      if ($window.location.pathname == '/login') {
        $window.location.href = $scope.redirectUri;
        return;
      }
      $window.location.reload(true);
    });

    $scope.login = function() {
      $scope.error = false;
      $scope.submitting = true;
      User.login($scope.user, function(error, status) {
        $scope.error = status;
        $scope.submitting = false;
      });
    };
  }
  ]);
})();
