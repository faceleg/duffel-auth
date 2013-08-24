'use strict';

function IndexController($scope, User) {
  $scope.user = User;
  $scope.headers = [
    {
      title: 'Name',
      property: 'name',
      template: '<a href="/users/admin/user/{{ item.id }}">{{ item.name }}</a>'
    },
    {
      title: 'Email',
      property: 'email'
    },
    {
      title: 'Status',
      property: 'status'
    }
  ];
};

angular.module('admin-users.controllers', [])
  .controller('IndexController', [
    '$scope', 'User', IndexController
  ]);
