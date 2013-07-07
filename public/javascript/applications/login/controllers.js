'use strict';

function LoginController($scope, $http, $window) {
  $scope.user = {};
  $scope.failedOnce = false;
  $scope.submitting = false;

  $scope.login = function() {
    $scope.error = false;
    $scope.submitting = true;
    $http.post('/login', $scope.user).
      success(function(data, status, headers, config) {
        $window.location.href = '/dashboard';
      }).
      error(function(data, status, headers, config) {
        $scope.error = status;
        $scope.failedOnce = true;
        $scope.submitting = false;
    });
  };
};

angular.module('login.controllers', []).
  controller('LoginController', ['$scope', '$http', '$window', LoginController]);
