'use strict';


// Declare app level module which depends on filters, and services
angular.module('main', [
  'ngRoute',
  'listDirective',
  'controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
}]);