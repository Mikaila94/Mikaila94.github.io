'use strict';

angular.module('myApp.subjects', ['ngRoute', 'ui.checkbox'])


    .controller('subjectsCtrl', function ($scope, $http, $cookies, $base64, subjectService, requestService, apiUrl) {
        requestService.httpGet("/subjects/mine")
            .then(function (response) {
                subjectService.setUserSubjects(response.map(function (subject) {
                    return subject._id
                }));
                $scope.items = response;
        });
        $scope.deleteMode = false;
        $scope.deleteElements = {};
        $scope.deleteSubjects = function () {
            for(var subject in $scope.deleteElements) {
                if($scope.deleteElements[subject] == true) {
                    $http({
                        url: apiUrl + '/subjects/mine/' + subject,
                        method: "DELETE",
                        headers: $cookies.getObject('token')
                    }).success(function (response, status) {
                        requestService.httpGet("/subjects/mine")
                            .then(function (response) {
                                subjectService.setUserSubjects(response.map(function (subject) {
                                    return subject._id
                                }));
                                $scope.items = response;
                                $scope.deleteMode = false;
                                $scope.deleteElements = {};
                            });
                    })
                }
            }
        };
        $scope.setTargetSubject = function (target) {
            $scope.targetSubject = target._id;
            subjectService.setSubject(target)
        };
        $scope.closeFilter = function () {
            $scope.filterMode = false;
            $scope.filterSubjects = "";
        }


    });

