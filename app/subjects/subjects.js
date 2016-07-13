'use strict';

angular.module('myApp.subjects', ['ngRoute', 'ui.checkbox'])


    .controller('subjectsCtrl', function ($scope, $http, $cookies, $base64, subjectService, apiUrl) {
        $http({
            url: apiUrl + '/subjects/mine',
            method: "GET",
            headers: {
                'X-Access-Token': $cookies.getObject('token')
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
                            'X-Access-Token': $cookies.getObject('token')
                        }
                    }).success(function (response, status) {
                        console.log(status);
                        $http({
                            url: apiUrl + '/subjects/mine',
                            method: "GET",
                            headers: {
                                'X-Access-Token': $cookies.getObject('token')
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
        $scope.closeFilter = function () {
            $scope.filterMode = false;
            $scope.filterSubjects = "";
        }


    })


    .controller('addCtrl', function ($scope, $http, $cookies,$location, subjectService, apiUrl, focus, shuffle) {
        if(!subjectService.getUserSubjects()) {
            $location.path("/subjects")
        } else {
            $http({
                url: apiUrl + '/subjects',
                method: "GET",
                headers: {
                    'X-Access-Token': $cookies.getObject('token')
                }
            }).success(function (response) {
                $scope.items = [];
                for(var subject in response) {
                    $scope.items.push(response[subject]);
                }
                shuffle($scope.items)

            });
            $scope.addSubject = function (subject) {
                $http({
                    url: apiUrl +'/subjects',
                    method: "POST",
                    data: {
                        "subject": {
                            code: subject.code,
                            name: subject.name,
                            public: true,
                            description: "Laget av ekte tælling " + $cookies.getObject('username')
                        }
                    },
                    headers: {
                        'X-Access-Token': $cookies.getObject('token')
                    }
                }).success(function (response, status) {
                    $location.path("/subjects");
                    console.log(status)
                }).error(function (status) {
                    console.log({error: status});
                })
            };
            $scope.searchSubjects = function (val) {
                return $http.get(apiUrl + "/subjects?search=" + val, {

                }).then(function (response) {
                    var resultList = [];
                    var resultInfoAdded = {};
                    angular.forEach(response.data, function (subject) {
                        if(!resultInfoAdded[subject.code]) {
                            resultList.push(subject);
                            resultInfoAdded[subject.code] = [subject.name]
                        } else {
                            if(resultInfoAdded[subject.code].indexOf(subject.name) == -1) {
                                console.log(resultInfoAdded[subject.code]);
                                console.log(subject.name);
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

