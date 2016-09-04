'use strict';

angular.module('myApp.subjects', ['ngRoute', 'ui.checkbox'])


    .controller('subjectsCtrl', function ($scope, $http, $cookies, $base64, $uibModal,$location, subjectService, requestService, apiUrl) {
        $scope.deleteMode = false;
        $scope.mouseOver = {};
        requestService.httpGet("/subjects/mine")
            .then(function (response) {
                subjectService.setUserSubjects(response.map(function (subject) {
                    return subject._id
                }));
                $scope.subjects = response;
        });


        $scope.deleteSubject = function (index, event) {
            event.stopPropagation();
            $http({
                url: apiUrl + '/subjects/mine/' + $scope.subjects[index]._id,
                method: "DELETE",
                headers: $cookies.getObject('token')
            }).success(function (response, status) {
                $scope.subjects.splice(index, 1);
                requestService.httpGet("/subjects/mine")
                    .then(function (response) {
                        subjectService.setUserSubjects(response.map(function (subject) {
                            return subject._id
                        }));
                        $scope.subjects = response;
                    });
            })
        };
        $scope.setTargetSubject = function (target) {
            $scope.targetSubject = target._id;
            subjectService.setSubject(target);
            $location.path('subjects/' + $scope.targetSubject)

        };

        $scope.openAddSubjectModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addSubjectModal.html',
                controller: 'addSubjectModalCtrl',
                windowClass: 'app-modal-small'
            });

            modalInstance.result.then(function (insertedId) {
                $location.path('subjects/' + insertedId)
            })
        }

    })

    .controller('addSubjectModalCtrl', function ($scope, $http, $cookies, $uibModalInstance, $timeout, apiUrl, focus, alertify) {
        focus('newSubjectCode');
        $scope.getSubjectSuggestions = function (val) {
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
            $scope.newSubjectCode = item.code;
            if(!item.new) {
                if(!$scope.newSubjectName) {
                    $scope.newSubjectName = item.name;
                }
            }
            $timeout(function () {
                focus('newSubjectName')

            },0)
        };

        $scope.addSubject = function () {
            $http({
                ignoreLoadingBar:true,
                url: apiUrl +'/subjects/mine',
                method: "POST",
                data: {
                    "subject": {
                        code: $scope.newSubjectCode,
                        name: $scope.newSubjectName,
                        published: 'no',
                        collections: [],
                        description: "Laget av ekte tælling " + $cookies.getObject('username')
                    }
                },
                headers: $cookies.getObject('token')

            }).success(function (response, status) {
                $uibModalInstance.close(response.insertedId);
            }).error(function (status) {
                alertify.error("Oops! Noe gikk galt...");
                console.log({error: status});
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
        }
        
    });

