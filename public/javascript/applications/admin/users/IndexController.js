(function() {
  'use strict';

  angular.module('admin-users.controllers')
  .controller('IndexController', [
    '$scope', 'User', 'ngTableParams',
    function IndexController($scope, User, ngTableParams) {

      $scope.userPromise = null;
      $scope.adminUserTableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          email: 'asc'
        }
      }, {
        total: 0,
        getData: function($defer, params) {
          $scope.userPromise = User.query(params.url(), function(data) {
            params.total(data.total);
            $defer.resolve(data.result);
          });
        }
      });
    }
  ]);
})();
