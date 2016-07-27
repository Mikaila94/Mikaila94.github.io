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
        'myApp.services',
        'naif.base64',
        'as.sortable',
        'uiSwitch',
        'blockUI',
        'ngAlertify']
    )
    .config(['$locationProvider', '$routeProvider', 'cfpLoadingBarProvider', 'blockUIConfig','apiUrl',function ($locationProvider, $routeProvider, cfpLoadingBarProvider, blockUIConfig,apiUrl) {
        blockUIConfig.requestFilter = function (config) {
            // If the request starts with '/api/quote' ...
            if (config.url.indexOf(apiUrl + "/subjects?search=") > -1 || config.url.indexOf('/reports') > -1) {
                return false;
            }
            //if(config.urlRoot) {
            //    return false; // ... don't block it.
            //}
        };


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
                controller: "editCtrl",
                param: 'editParam'
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
    .controller('mainController', function ($scope, $window, $location, $http, $q, Auth, $cookies,$rootScope,PreviousState) {
        $scope.isCollapsed = true;

        $scope.$watch(Auth.isLoggedIn, function (value, oldValue) {

            if (!value && oldValue) {
                console.log("Disconnect");
                $location.path('/login');
            }

            if (value) {
                console.log("Connect");
                //Do something when the user is connected
            }

        }, true);

        $scope.checkLoggedIn = function () {
            return $cookies.getObject('token') ? true: false;
        };

        $scope.logOut = function () {
            if(confirm("Er du sikker på at du vil logge ut?")){
                Auth.setToken(false);
                $cookies.remove('token');
                $cookies.remove('username');
                $cookies.remove('password');
                $location.path('/login');
            }
        };
    })

    .constant("apiUrl", "https://acepi-test.herokuapp.com")
    //.constant("apiUrl", "http://192.168.31.54:3000")
    //.constant("apiUrl", "https://acepi.herokuapp.com/subjects")
    .factory('focus', function ($timeout, $window) {
        return function (id) {
            {
                $timeout(function () {
                    var element = $window.document.getElementById(id);
                    if (element) {
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
    }).factory('PreviousState', ['$rootScope',
    function ($rootScope) {

        var previousRoute = undefined;


        $rootScope.$on("$routeChangeSuccess", function (event, current,previous) {
            previousRoute = previous
        })

        return {
            getPrevious: function (){ return previousRoute;},
        }

    }]).service('RestService', function () {
    })
    .run(['$rootScope','$location', 'Auth','PreviousState', function ($rootScope, $location, Auth,PreviousState) {

    $rootScope.$on('$routeChangeStart', function (event, current) {
        if (current.$$route.originalPath.indexOf('register') > -1) {
            console.log('ALLOW LOGIN/REGISTER');
        }
        else if (!Auth.isLoggedIn()) {
            console.log('DENY');
            //event.preventDefault();
            $location.path('/login');
        }

        else {
            console.log('ALLOW');
        }
    });

    $rootScope.PreviousState = PreviousState;

}]);




