'use strict';

function LoginController($scope, $http, $window) {
  $scope.user = {};
  $scope.failedOnce = false;
  $scope.login = function() {
    $scope.error = false;
    $http.post('/login', $scope.user).
      success(function(data, status, headers, config) {
        $window.location.href = '/dashboard';
    }).
      error(function(data, status, headers, config) {
        $scope.error = status;
        $scope.failedOnce = true;
    });
  };
};

angular.module('login.controllers', []).
  controller('LoginController', ['$scope', '$http', '$window', LoginController]);
