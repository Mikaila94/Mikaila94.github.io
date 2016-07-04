'use strict';

angular.module('myApp.subjects', ['ngRoute'])


    .controller('subjectsCtrl', function ($scope, $http) {
        $http({
            url: "https://acepi.herokuapp.com/subjects",
            method: "GET",
            params: {"environment": "production"}
        }).success(function (response) {
            $scope.items = response;

        })

        $scope.alert = function () {
            alert("Hei jonas");
        }


    })


    .controller('addCtrl', function ($scope, $http) {
        $http({
            url: "https://acepi.herokuapp.com/subjects",
            method: "GET",
            params: {"environment": "production"}
        }).success(function (response) {
            $scope.items = response;

        })


    });