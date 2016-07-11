'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.subjects',
    'myApp.login',
    'myApp.collections',
    'ngAnimate',
    'ui.bootstrap',
    'ngTagsInput',
    'ng-mfb'])
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

    $routeProvider
      .when("/login", {
          templateUrl: "login/login.html",
          controller: "loginCtrl"
      })
      .when("/subjects", {
        templateUrl: "subjects/subjects.html",
        controller: "subjectsCtrl"
      })
      .when("/add", {
            templateUrl: "subjects/add.html",
            controller: "addCtrl"
      }).when("/subjects/:subjectId", {
            templateUrl: "collections/collections.html",
            controller: "collectionsCtrl"
        })
      .when("/subjects/:subjectId/collections/:collectionsId", {
          templateUrl: "collections/edit.html",
          controller: "editCtrl"
      })
      .when("/view1", {
          templateUrl: "view1/view1.html",
          controller: "View1Ctrl"
      })
      .when("/view2", {
        templateUrl: "view2/view2.html",
        controller: "View2Ctrl"
      })
      .otherwise({redirectTo: '/login'});
}])
    .controller('mainController', function($scope, $window,$location, $http) {
        $scope.isCollapsed = true;

    })

    .constant("apiUrl", "https://acepi.herokuapp.com/subjects")

    .service("subjectService", function() {
        var subject;

        var setSubject= function(targetSubject) {
            subject = targetSubject
        };
        var getSubject = function() {
            return subject
        };

        return {
            setSubject: setSubject,
            getSubject: getSubject
        }

    })

    .service("collectionService",function(){
        var collection;

        var setCollection = function(targetCollection){
            collection = targetCollection
        };
        var getCollection = function(){
            return collection;
        };

        return{
            setCollection : setCollection,
            getCollection : getCollection

        }


    })
    ;



