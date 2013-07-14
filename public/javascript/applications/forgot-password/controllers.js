'use strict';

function ForgotPasswordController($scope, $http, $window) {
  $scope.user = {};
  $scope.submitting = false;
  $scope.emailed = false;

  $scope.submit = function() {
    $scope.error = false;
    $scope.submitting = true;
    $http.post('/forgot-password', $scope.user).
      success(function(data, status, headers, config) {
        $scope.emailed = true;
      }).
      error(function(data, status, headers, config) {
        $scope.error = status;
        $scope.submitting = false;
    });
  };
};

angular.module('forgotPassword.controllers', []).
  controller('ForgotPasswordController', ['$scope', '$http', '$window', ForgotPasswordController]);
