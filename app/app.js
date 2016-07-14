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
    'ng-mfb',
    'ngCookies',
    'angular-loading-bar',
    'myApp.services']
)
    .config(['$locationProvider', '$routeProvider','cfpLoadingBarProvider', function($locationProvider, $routeProvider,cfpLoadingBarProvider) {
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container'
        cfpLoadingBarProvider.spinnerTemplate = '<div align="center"><span class="fa fa-spinner"> </span> <label>Loading....</label></div>';


    $routeProvider
        .when("/login", {
        templateUrl: "login/login.html",
        controller: "loginCtrl"
        })
        .when("/register", {
            templateUrl: "login/register.html",
            controller: "registerCtrl"
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
        .when("/subjects/:subjectId/collections/:collectionId", {
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
    .controller('mainController', function($scope, $window,$location, $http,$q) {
        $scope.isCollapsed = true;

    })

    //.constant("apiUrl", "https://acepi.herokuapp.com/subjects")
    .constant("apiUrl", "http://192.168.10.207:3000")
    .factory('focus', function ($timeout, $window) {
        return function (id) { {
            $timeout(function () {
                var element = $window.document.getElementById(id);
                if(element) {
                    element.focus()
                }
            })
        }

        }
    })
    .factory('shuffle', function () {
        return function (array) {
            var m = array.length, t, i;

            while (m) {
                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);

                // And swap it with the current element.
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }

            return array;
        }
    }).service('RestService', function () {});




