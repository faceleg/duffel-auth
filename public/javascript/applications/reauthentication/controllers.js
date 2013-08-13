'use strict';

/**
 * Handle lapsed authentication state checks, opening the reauthentication
 * dialog if required.
 *
 * @param {Object} $scope
 * @param {Object} $rootScope
 * @param {Object} $http
 * @param {Object} $timeout
 */
function ReauthenticationController($scope, authenticationService) {
  $scope.open = false;  // dialog initially closed
  $scope.options = {
    dialogFade: true,
    backdropClick: false,
    keyboard: false
  }
  $scope.$on('event:auth-loginRequired', function() {
    $scope.open = true;
  });
  $scope.$on('event:auth-loginConfirmed', function() {
    $scope.open = false;
  });
};

/**
 * Manage the reauthentication form.
 *
 * @fires event:auth-loginConfirmed
 * @param {Object} $scope
 * @param {Object} $rootScope
 * @param {Object} $http
 */
function ReauthenticationFormController($scope, $rootScope, $http, authenticationService) {
  $scope.user = {};
  $scope.submitting = false;

  $scope.$on('event:auth-loginRequired', function() {
    $scope.submitting = false;
    $scope.error = 401;
  });
  $scope.$on('event:auth-loginConfirmed', function() {
    $scope.error = false;
    $scope.submitting = false;
  })
  $scope.login = function() {
    $scope.error = false;
    $scope.submitting = true;
    $scope.user =  authenticationService.login($scope.user, function(data, status) {
      $scope.error = status;
      $scope.submitting = true;
    });
  };
}

angular.module('reauthentication.controllers', [])
  .controller('ReauthenticationController', [
    '$scope', 'authenticationService', ReauthenticationController
  ])
  .controller('ReauthenticationFormController', [
    '$scope', '$rootScope', '$http', 'authenticationService', ReauthenticationFormController
  ]);
