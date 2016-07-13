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
    'ngCookies']
)
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

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
    .service("subjectService", function() {
        var subject;
        var userSubjects;

        var setSubject= function(targetSubject) {
            subject = targetSubject
        };
        var getSubject = function() {
            return subject
        };
        var setUserSubjects = function (subjects) {
            userSubjects = subjects;
        };
        var getUserSubjects = function () {
            return userSubjects;
        };
        return {
            setSubject: setSubject,
            getSubject: getSubject,
            setUserSubjects: setUserSubjects,
            getUserSubjects: getUserSubjects
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
    }).service('RestService', function () {
    this.putSubject = function ($scope,$http) {
        var exerciseList = [];
        angular.forEach($scope.exercises, function (exercise) {
            var newExercise = {};
            if (exercise.type == "mc") {
                newExercise = {
                    question: exercise.question,
                    correctAnswer: exercise.correctAnswer,
                    type: exercise.type,
                    alternatives: exercise.alternatives
                }
                console.log("mc")
            } else if (exercise.type == "pd") {
                newExercise = {
                    question: exercise.question,
                    correctAnswer: exercise.correctAnswer,
                    type: exercise.type,
                    tags: exercise.tags.map(function (tag) {
                        return tag.text
                    })
                };
                console.log("pd")
            } else if (exercise.type == "tf") {
                newExercise = {
                    question: exercise.question,
                    correctAnswer: exercise.correctAnswer,
                    type: exercise.type
                }
            }
            ;
            exerciseList.push(newExercise)
        });
        $scope.collection.exercises = exerciseList;
        $scope.exercises = $scope.collection.exercises;
        console.log(exerciseList);
        var data = {
            subject: subjectService.getSubject()
        };

        $http({
            url: apiUrl + '/subjects/' + subjectService.getSubject()._id,
            method: 'PUT',
            headers: {'x-access-token': $cookies.getObject("token")},
            data: data
        }).success(function (response, status) {
            console.log("heihheihieiheresponse:" + response + "\n\n\n\nstatus:");
        }).error(function (data, status, header, config) {
            console.log(data)
            console.log(status)
            console.log(header)
            console.log(config)
            console.log(subjectService.getSubject())

        })
    };


    this.postSubject = function ($scope,$http) {
        return $q(function (resolve, reject) {
                var data = {
                    collection: {
                        name: $scope.collection.name,
                        exercises: $scope.exercises,
                        public: $scope.public

                    }
                };


                $http({
                    url: apiUrl + '/subjects/' + subjectService.getSubject()._id + "/collections",
                    method: 'POST',
                    headers: {'x-access-token': $cookies.getObject("token")},
                    data: data
                }).success(function (response, status) {
                    $scope.collection._id = response.insertedId;
                    collectionService.setCollection($scope.collection);
                    resolve(true);
                    for (var i = 0; i < $scope.exercises.length; i++) {
                        $scope.exercises[i].collectionId = $scope.collection._id;
                    }
                }).error(function (data, status, header, config) {
                    console.log("Data: " + data +
                        "\n\n\n\nstatus: " + status +
                        "\n\n\n\nheaders: " + header +
                        "\n\n\n\nconfig: " + config);
                });
            }
        )
    };
});




