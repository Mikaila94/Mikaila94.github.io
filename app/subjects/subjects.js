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


    })


    .controller('addCtrl', function ($scope, $http, $cookies,$location, subjectService, requestService, apiUrl, focus, shuffle,blockUI) {
        blockUI.stop();
        if(!subjectService.getUserSubjects()) {
            $location.path("/subjects")
        } else {
            requestService.httpGet("/subjects")
                .then(function (response) {
                    $scope.items = [];
                    for(var subject in response) {
                        $scope.items.push(response[subject]);
                    }
                    shuffle($scope.items)
            });
            $scope.addSubject = function (subject) {
                $http({
                    ignoreLoadingBar:true,
                    url: apiUrl +'/subjects/mine',
                    method: "POST",
                    data: {
                        "subject": {
                            code: subject.code,
                            name: subject.name,
                            public: true,
                            collections: [],
                            description: "Laget av ekte tælling " + $cookies.getObject('username')
                        }
                    },
                    headers: $cookies.getObject('token')
                    
                }).success(function (response, status) {
                    $location.path("/subjects");
                }).error(function (status) {
                    console.log({error: status});
                })
            };
            $scope.searchSubjects = function (val) {
                return $http({
                    url: apiUrl + "/subjects?search=" + val,
                    method:'GET',
                    ignoreLoadingBar:true
                })
                    .then(function (response) {
                    var resultList = [];
                    var resultInfoAdded = {};
                    angular.forEach(response.data, function (subject) {
                        if(!resultInfoAdded[subject.code]) {
                            resultList.push(subject);
                            resultInfoAdded[subject.code] = [subject.name]
                        } else {
                            if(resultInfoAdded[subject.code].indexOf(subject.name) == -1) {
                                resultList.push(subject);
                                resultInfoAdded[subject.code].push(subject.name)
                            }
                        };
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
                    focus('newName')

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

