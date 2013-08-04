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

function ReauthenticationController($scope, $rootScope, $http, $timeout) {
  var POLL_FREQUENCY = 5 * 60 * 1000;

  /**
   * Poll the server to determine login state.
   */
  var checkLoginState = function() {
    $http.head('/api/login-state')
      .success(function() {
      $timeout(checkLoginState, POLL_FREQUENCY);
    })
      .error(function(data) {
      $rootScope.$broadcast('event:auth-loginRequired');
    });
  }
  $timeout(checkLoginState, POLL_FREQUENCY);

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
    $timeout(checkLoginState, POLL_FREQUENCY);
  });
};

/**
 * Mange the reauthentication form.
 *
 * @fires event:auth-loginConfirmed
 * @param {Object} $scope
 * @param {Object} $rootScope
 * @param {Object} $http
 */

function ReauthenticationFormController($scope, $rootScope, $http) {
  $scope.user = {};
  $scope.submitting = false;

  $scope.$on('event:auth-loginRequired', function() {
    $scope.submitting = false;
    $scope.error = 401;
  });
  $scope.login = function() {
    $scope.error = false;
    $scope.submitting = true;
    $http.post('/login', $scope.user).
    success(function(data, status, headers, config) {
      $rootScope.$broadcast('event:auth-loginConfirmed');
    }).
    error(function(data, status, headers, config) {
      $scope.error = status;
      $scope.submitting = false;
    });
  };
}

angular.module('reauthentication.controllers', [])
  .controller('ReauthenticationController', ['$scope', '$rootScope', '$http', '$timeout', ReauthenticationController])
  .controller('ReauthenticationFormController', ['$scope', '$rootScope', '$http', ReauthenticationFormController]);
