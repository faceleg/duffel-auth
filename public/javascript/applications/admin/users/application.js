(function() {
  'use strict';

  angular.module('admin-users', [
    'user',
    'admin-users.controllers',
    'ngTable', 'cgBusy'
  ]);

  angular.module('admin-users').value('cgBusyDefaults',{
      message: 'Loading users',
      templateUrl: '/bower/angular-busy/angular-busy.html',
      minDuration: 700
  });

})();
