'use strict';

function LoginController($scope, User, $window) {
  $scope.user = {};
  $scope.submitting = false;

  $scope.$on('event:auth-loginConfirmed', function() {
      // Only redirect if currently on the login page.
      if ($window.location.pathname == '/login') {
        return $window.location.href = '/';
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
    '$scope', 'User', '$window', LoginController
  ]);
