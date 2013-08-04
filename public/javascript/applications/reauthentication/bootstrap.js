(function() {
  'use strict';
  var applicationElement = document.createElement('div');
  applicationElement.setAttribute('ng-cloak', '');
  applicationElement.setAttribute('class', 'angular-application');
  applicationElement.setAttribute('application-name', 'reauthentication');

  var ngInclude = document.createElement('div');
  ngInclude.setAttribute('ng-include', '');
  ngInclude.setAttribute('src', '"/duffel-auth/reauthenticate"');
  ngInclude.setAttribute('ng-controller', 'ReauthenticationController');
  applicationElement.appendChild(ngInclude);

  var scriptTags = document.getElementsByTagName('script');
  var containingScriptTag = scriptTags[scriptTags.length - 1];
  containingScriptTag.parentNode.insertBefore(applicationElement, containingScriptTag.nextSibling);
})();
