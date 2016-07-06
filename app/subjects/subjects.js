'use strict';

angular.module('myApp.subjects', ['ngRoute'])


    .controller('subjectsCtrl', function ($scope, $http, subjectService, apiUrl) {
        $http({
            url: apiUrl,
            method: "GET",
            params: {"environment": "production"}
        }).success(function (response) {
            $scope.items = response;

        });
        $scope.setTargetSubject = function (target) {
            $scope.targetSubject = target._id;
            subjectService.setSubject(target)
        };


    })


    .controller('addCtrl', function ($scope, $http, apiUrl) {
        $http({
            url: apiUrl,
            method: "GET",
            params: {"environment": "production"}
        }).success(function (response) {
            $scope.items = response;

        });

        $scope.quantity = 5;


    })

