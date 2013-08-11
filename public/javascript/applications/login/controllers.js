'use strict';

function LoginController($scope, $http, $window) {
  $scope.user = {};
  $scope.submitting = false;

  $scope.login = function() {
    $scope.error = false;
    $scope.submitting = true;
    $http.post('/login', $scope.user).
      success(function(data, status, headers, config) {

        // Only redirect if currently on the login page.
        if ($window.location.pathname == '/login') {
          return $window.location.href = '/';
        }
        $window.location.reload(true);
      }).
      error(function(data, status, headers, config) {
        $scope.error = status;
        $scope.submitting = false;
    });
  };
};

angular.module('login.controllers', []).
  controller('LoginController', ['$scope', '$http', '$window', LoginController]);
