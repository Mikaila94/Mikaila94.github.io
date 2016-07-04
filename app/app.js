'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.subjects',
    'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

  $routeProvider
      .when("/subjects", {
        templateUrl: "subjects/subjects.html",
        controller: "subjectsCtrl"
      })
      .when("/add", {
          templateUrl: "subjects/add.html",
          controller: "addCtrl"
      })
      .when("/view1", {
          templateUrl: "view1/view1.html",
          controller: "View1Ctrl"
      })
      .when("/view2", {
        templateUrl: "view2/view2.html",
        controller: "View2Ctrl"
      })
      .otherwise({redirectTo: '/subjects'});
}]);
