'use strict';

angular.module('myApp.subjects', ['ngRoute', 'ui.checkbox'])


    .controller('subjectsCtrl', function ($scope, $http, $cookies, $base64, subjectService, apiUrl) {
        $http({
            url: apiUrl + '/subjects/mine',
            method: "GET",
            headers: {
                'x-access-token': $cookies.getObject('token')
            }
        }).success(function (response) {
            subjectService.setUserSubjects(response.map(function (subject) {
                return subject._id
            }));
            $scope.items = response;
        });
        $scope.deleteMode = false;
        $scope.deleteElements = {};
        $scope.deleteSubjects = function () {
            for(var exercise in $scope.deleteElements) {
                if($scope.deleteElements[exercise] == true) {
                    $http({
                        url: apiUrl + '/subjects/' + exercise,
                        method: "DELETE",
                        headers: {
                            'x-access-token': $cookies.getObject('token')
                        }
                    }).success(function (response, status) {
                        console.log(status);
                        $http({
                            url: apiUrl + '/subjects/mine',
                            method: "GET",
                            headers: {
                                'x-access-token': $cookies.getObject('token')
                            }
                        }).success(function (response) {
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


    })


    .controller('addCtrl', function ($scope, $http, $cookies,$location, subjectService, apiUrl) {
        if(!subjectService.getUserSubjects()) {
            $location.path("/subjects")
        } else {
            $http({
                url: apiUrl + '/subjects',
                method: "GET",
                headers: {
                    'x-access-token': $cookies.getObject('token')
                }
            }).success(function (response) {
                $scope.items = [];
                for(var subject in response) {
                    if(subjectService.getUserSubjects().indexOf(response[subject]._id) == -1) {
                        $scope.items.push(response[subject])
                    }
                }

            });
            $scope.addSubject = function (subject) {
                $http({
                    url: apiUrl +'/subjects',
                    method: "POST",
                    data: {
                        "subject": {
                            code: subject.code,
                            name: subject.name
                        }
                    },
                    headers: {
                        'x-access-token': $cookies.getObject('token')
                    }
                }).success(function (response, status) {
                    $location.path("/subjects");
                    console.log(status)
                })
            };
            $scope.searchSubjects = function (val) {
                return $http.get(apiUrl + "/subjects?search=" + val, {

                }).then(function (response) {
                    var resultList = [];
                    var resultIds = [];
                    angular.forEach(response.data, function (subject) {
                        if(subjectService.getUserSubjects().indexOf(subject._id) == -1 && resultIds.indexOf(subject._id) == -1) {
                            resultList.push(subject);
                            resultIds.push(subject._id)
                        }
                    });
                    resultList.push({
                        code: val.toUpperCase(),
                        name: "Opprett ny",
                        new: true
                    });
                    return resultList
                })
            };
            $scope.selectedSubject = function (item) {
                if(item.new) {
                    $scope.editNew = true;
                    $scope.newCode = item.code;
                    $scope.newName = "";

                }
                else {
                    $scope.addSubject(item);
                }

            };
            $scope.cancelNew = function () {
                $scope.editNew = false;
                $scope.newCode = "";
                $scope.newName = "";
                $scope.searchTerm = "";
            };
            $scope.saveNew = function () {
                var newSubject = {
                    code: $scope.newCode,
                    name: $scope.newName

                };
                $scope.addSubject(newSubject)
            };

            $scope.quantity = 5;

        }


    });

