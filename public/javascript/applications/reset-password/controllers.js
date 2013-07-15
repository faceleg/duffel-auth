'use strict';

function ResetPasswordController($scope, $http, $window) {
  $scope.user = {};
  $scope.submitting = false;
  $scope.formError = false;

  $scope.passwordsMatch = function() {
    if ($scope.user.password == '') return true;
    if ($scope.user.repeatPassword == '') return true;
    return $scope.user.password == $scope.user.repeatPassword;
  }

  $scope.submit = function(form) {
    $scope.submitting = true;
    for (var key in form) {
      if (form[key] && form[key].$error) {
        form[key].$error.mongoose = null;
      }
    }
    $http.post($window.location.pathname, $scope.user).
      success(function(data, status, headers, config) {
        $window.location.href = '/login';
      }).
      error(function(data, status, headers, config) {
        if (!data || !data.error) {
          $scope.formError = 'Server error, please try again';
        }
        for (key in data.error.errors) {
          form[key].$error.mongoose = data.error.errors[key].type;
        }
        $scope.submitting = false;
    });
  };
};

angular.module('resetPassword.controllers', []).
  controller('ResetPasswordController', ['$scope', '$http', '$window', ResetPasswordController]);
