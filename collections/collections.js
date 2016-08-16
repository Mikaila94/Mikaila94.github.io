angular.module('myApp.collections', ['ngRoute'])

    .controller('collectionsCtrl', function ($scope, $window, $cookies, $http, $uibModal, $routeParams, subjectService, collectionService, requestService,alertify,$location) {
        var initCollections = function (subject) {
            $scope.collections = subject.collections;
        };
        var initReports = function (reportInfo) {
            var reportedCollectionIds = [];
            $scope.reportedCollections = {};
            angular.forEach(reportInfo, function (item) {
                reportedCollectionIds.push(item.collectionId);
                item.lastAdded = item.reports[item.reports.length - 1].date
            });
            $scope.reportedExercises = reportInfo;
            angular.forEach($scope.subject.collections, function (collection) {
                if (reportedCollectionIds.indexOf(collection._id) != -1) {
                    $scope.reportedCollections[collection._id] = collection;
                }
            });
            console.log($scope.reportedExercises)
        };
        $scope.subject = subjectService.getSubject();

        var refresh = function () {
            requestService.httpGet("/subjects/mine/" + $routeParams.subjectId + "?editor=true")
                .then(function (response) {
                    $scope.subject = response;
                    $scope.nameCopy = $scope.subject.name;
                    subjectService.setSubject($scope.subject);
                    initCollections(response);
                    console.log(response);
                    requestService.httpGet('/reports/' + $routeParams.subjectId).then(function (response) {
                        initReports(response)
                    })
                });
        };
        refresh();


        $scope.setTargetCollection = function (index) {
            subjectService.setSubjectToCopy(subjectService.getSubjectCopy());
            $scope.subject = subjectService.getSubject();
            if(index != "new") {
                $scope.targetCollection = $scope.subject.collections[index]._id;
                collectionService.setCollection($scope.subject.collections[index])
            }
        };

        $scope.deleteCollection = function (coll, index) {
            $scope.subject.collections.splice(index, 1);
        };

        $scope.saveSubject = function () {
            var data = {
                subject: $scope.subject
            };
            console.log(data);
            requestService.httpPut($scope.subject._id, data)
                .then(function (response) {
                    refresh();
                    alertify.success("Suksess! Endringene dine ble lagret.");
                },function(response){

                    $scope.errorMsg = response.errors[0].dataPath.split('.');
                    if($scope.errorMsg.length == 3){
                        if($scope.errorMsg[2].indexOf('name') > -1) {
                            alertify.error("Fagnavn mangler! Fyll ut og prøv igjen...");
                        }
                        else{
                            alertify.error("Oops, noe gikk galt! Prøv igjen...");

                        }
                    }
                    else{
                        alertify.error("Oops, noe gikk galt! Prøv igjen...")

                    }

                })
        };

        $scope.openReportModal = function (collectionId, exerciseId) {
            subjectService.setSubjectToCopy(subjectService.getSubjectCopy());
            $scope.subject = subjectService.getSubject();
            initCollections($scope.subject);
            initReports($scope.reportedExercises);
            $scope.changesMade = {};
            $scope.changesMade.value = false;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'reportModal.html',
                controller: 'reportModalCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    reportedExercises: function () {
                        return $scope.reportedExercises
                    },
                    reportedCollections: function () {
                        return $scope.reportedCollections
                    },
                    exerciseId: function () {
                        return exerciseId
                    },
                    collectionId: function () {
                        return collectionId
                    },
                    changesMade: function () {
                        return $scope.changesMade
                    }
                }

            });

            modalInstance.result.then(function () {
                if($scope.changesMade.value) {
                    refresh();
                }
            }, function () {
                if($scope.changesMade.value) {
                    refresh();
                }
            });
        };

        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            containment: '#collectionsTable'
        };

        $scope.goTo = function(path){
            $location.path(path);
        };


    })
    .controller('reportModalCtrl', function ($scope, $http, $uibModalInstance, $q, reportedExercises, reportedCollections, exerciseId, collectionId, changesMade, subjectService, requestService, apiUrl) {
        $scope.changesMade = changesMade;
        $scope.collections = reportedCollections;
        $scope.exercises = reportedExercises;
        var previewMaxLength = 100;
        var exerciseCopyInfo = {};
        for(var i=0; i<$scope.exercises.length; i++) {
            for(var j=0; j<$scope.collections[$scope.exercises[i].collectionId].exercises.length; j++) {
                var checkExercise = $scope.collections[$scope.exercises[i].collectionId].exercises[j];
                if($scope.exercises[i].exerciseId == checkExercise._id) {
                    $scope.exercises[i].preview = checkExercise.question.length > previewMaxLength ? checkExercise.question.substr(0, previewMaxLength) + "...": checkExercise.question;
                    break;
                }
            }
        }
        console.log($scope.exercises);


        $scope.onChosenExercise = function (collectionId, exerciseId) {
            console.log($scope.activeExercise);
            $scope.collection = $scope.collections[collectionId];
            $scope.removeElements = {};
            angular.forEach($scope.exercises, function (exercise, key) {
                if(exercise.exerciseId == exerciseId) {
                    exercise.index = key;
                    $scope.exerciseInfo = exercise;
                };
            });

            angular.forEach($scope.collection.exercises, function (exercise, key) {
                if (exercise._id == $scope.exerciseInfo.exerciseId) {
                    $scope.exercise = exercise;
                    exerciseCopyInfo.exercise = angular.copy(exercise);
                    exerciseCopyInfo.index = key;
                    console.log(exerciseCopyInfo)
                }
            });
            $scope.exerciseReportArrays = [[], []];
            $scope.splitPoint = Math.ceil($scope.exerciseInfo.reports.length / 2);

            for (var i = 0; i < $scope.splitPoint; i++) {
                $scope.exerciseReportArrays[0].push($scope.exerciseInfo.reports[i]);
                $scope.removeElements[i] = false
            }
            ;

            for (var j = $scope.splitPoint; j < $scope.exerciseInfo.reports.length; j++) {
                $scope.exerciseReportArrays[1].push($scope.exerciseInfo.reports[j]);
                $scope.removeElements[j] = false;
            }
            ;
            console.log($scope.removeElements)

        };

        if (collectionId && exerciseId) {
            $scope.onChosenExercise(collectionId, exerciseId)
        };
        $scope.addAlternative = function (exercise) {
            if (!exercise.alternatives) {
                exercise.alternatives = [];
            }
            exercise.alternatives.push("")
        };

        $scope.deleteAlternative = function (exercise, index) {
            if (index > -1) {
                exercise.alternatives.splice(index, 1);
            }
        };

        $scope.getExerciseTags = function (exercise) {
            if (!exercise.tags || exercise.tags.length == 0) {
                return
            }

            if (typeof exercise.tags[0] == "string") {
                return exercise.tags.toString()
            } else {
                return exercise.tags.map(function (tag) {
                    return tag.text
                }).toString()
            }
        };


        $scope.getImage = function (image) {
            if (!image.url) {
                return ("data:" + image[0].filetype + ";base64, " + image[0].base64);
            } else {
                var imageUrlParts = image.url.split('/');
                imageUrlParts[imageUrlParts.indexOf("upload") + 1] = "h_140";
                imageUrlParts.splice(0, 2);
                var newUrl = "http:/";
                angular.forEach(imageUrlParts, function (part) {
                    newUrl = newUrl + "/" + part
                });
                return newUrl;
            }
        };
        $scope.removeImage = function () {
            delete $scope.exercise.image;
            document.getElementById('image').value = ''
        };
        $scope.onChangeHandler = function (exercise) {
            return function (e, fileObjects) {
                if (fileObjects) {
                    exercise.image = fileObjects;
                }
            }
        };
        $scope.saveChanges = function () {
            console.log(subjectService.getSubject());
            var imageUpload =[];
            if($scope.exercise.image && !$scope.exercise.image.url) {
                var imageData = {
                    filetype: $scope.exercise.image[0].filetype,
                    base64: $scope.exercise.image[0].base64,
                    subjectId: subjectService.getSubject()._id
                };
                imageUpload.push(requestService.putImage(imageData, function (response) {
                    $scope.exercise.image = {url: response.secure_url}
                }))
            }
            var data = {
                subject: subjectService.getSubject()
            };
            $q.all(imageUpload).then(function () {
                requestService.httpPut(subjectService.getSubject()._id, data).then(function () {
                    var data = {
                        reports: []
                    };
                    $scope.changesMade.value = true;
                    angular.forEach($scope.removeElements, function (value, key) {
                        if(!value) {
                            data.reports.push($scope.exerciseInfo.reports[key])
                        }
                    });
                    $http({
                        url: apiUrl + '/reports/' + $scope.exercise._id,
                        method: 'PUT',
                        data: data
                    }).success(function () {
                        $scope.exerciseInfo.reports = data.reports;
                        console.log(data);
                        if(data.reports.length == 0) {
                            $scope.exercises.splice($scope.exerciseInfo.index, 1)
                        }
                        $scope.extraProperty = "";
                        $scope.activeExercise = undefined;
                        $scope.exercise = undefined;
                    });

                });

            });
        };
        $scope.removeAllReports = function (index) {
            var confirmRemoveAll = confirm('Sikker på at du vil slette alle tilbakemeldingene?');
            if(confirmRemoveAll){
                $http({
                    url: apiUrl + '/reports/' + $scope.exercises[index].exerciseId,
                    method: 'PUT',
                    data: {
                        reports: []
                    }
                }).success(function () {
                    $scope.exercises.splice(index, 1);
                });
            }
        };
        $scope.goToOverview = function () {

            $scope.collection.exercises[exerciseCopyInfo.index] = exerciseCopyInfo.exercise;
            $scope.exercise = undefined;
            $scope.extraProperty = "";
            $scope.activeExercise = undefined;
            console.log(subjectService.getSubject())
            
        };
        $scope.cancel = function () {
            $scope.exercise = undefined;
        };
        $scope.close = function () {
            $uibModalInstance.close();
        };

    });