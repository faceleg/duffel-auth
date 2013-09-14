'use strict';

function LoginController($scope, User, $window, $cookies, $cookieStore) {
  $scope.user = {};
  $scope.submitting = false;

  $scope.$on('event:auth-loginConfirmed', function() {
    var REDIRECT_COOKIE = 'duffel-auth-redirect',
      redirectUri = $cookies[REDIRECT_COOKIE];

    if (redirectUri) {
      $cookieStore.remove(REDIRECT_COOKIE);
      return $window.location.href = redirectUri;
    }
    if ($window.location.pathname == '/login') {
      return $window.location.href = $scope.redirectUri;
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
};

angular.module('login.controllers', [])
  .controller('LoginController', [
    '$scope', 'User', '$window', '$cookies', '$cookieStore', LoginController
]);
