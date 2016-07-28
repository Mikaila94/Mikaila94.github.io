angular.module('myApp.collections', ['ngRoute'])

    .controller('collectionsCtrl', function ($scope, $cookies, $http, $uibModal, $routeParams, subjectService, collectionService, requestService,alertify,$location) {
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
            $scope.targetCollection = $scope.subject.collections[index]._id;
            collectionService.setCollection($scope.subject.collections[index])
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
                    }
                }

            });

            modalInstance.result.then(function () {
                console.log(subjectService.getSubject());
                refresh();
            });
        };

        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            containment: '#collectionsTable'
        }

        $scope.goTo = function(path){
            $location.path(path);
        }

    })
    .controller('reportModalCtrl', function ($scope, $http, $uibModalInstance, $q, reportedExercises, reportedCollections, exerciseId, collectionId, subjectService, requestService, apiUrl) {

        $scope.collections = reportedCollections;
        $scope.exercises = reportedExercises;
        $scope.removeList = {};
        var previewMaxLength = 40;
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
            $scope.collection = $scope.collections[collectionId];
            angular.forEach($scope.exercises, function (exercise) {
                if(exercise.exerciseId == exerciseId) {
                    $scope.exerciseInfo = exercise
                };
            });

            angular.forEach($scope.collection.exercises, function (exercise) {
                if (exercise._id == $scope.exerciseInfo.exerciseId) {
                    $scope.exercise = exercise;
                }
            });
            $scope.exerciseReportArrays = [[], []];
            $scope.splitPoint = Math.ceil($scope.exerciseInfo.reports.length / 2);

            for (var i = 0; i < $scope.splitPoint; i++) {
                $scope.exerciseReportArrays[0].push($scope.exerciseInfo.reports[i])
                $scope.removeList[i] = false
            }
            ;

            for (var j = $scope.splitPoint; j < $scope.exerciseInfo.reports.length; j++) {
                $scope.exerciseReportArrays[1].push($scope.exerciseInfo.reports[j])
                $scope.removeList[j] = false;
            }
            ;
            console.log($scope.removeList)

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
        $scope.saveChanges = function () {
            var data = {
                subject: subjectService.getSubject()
            };
            console.log(subjectService.getSubject())

            requestService.httpPut(subjectService.getSubject()._id, data).then(function (response) {
                console.log(response);
                var data = {
                    reports: []
                };
                angular.forEach($scope.removeList, function (value, key) {
                    if(!value) {
                        data.reports.push($scope.exerciseInfo.reports[key])
                    }
                });
                $http({
                    url: apiUrl + '/reports/' + $scope.exercise._id,
                    method: 'PUT',
                    data: data
                }).success(function (response, status) {
                    console.log(data)
                    $uibModalInstance.close();
                });
                
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
        }

    })
    .controller('editCtrl', function ($scope, $cookies, $window, $document, $http, $routeParams, $location, $q, $uibModal, $rootScope, collectionService, subjectService, requestService, apiUrl, blockUI,alertify) {
        var ajv = new Ajv({removeAdditional: true});
        var validateExercise = function (schema, object) {
            return ajv.validate(schema, object);
        };


        $scope.collection = $routeParams.collectionId == 'new' ? undefined : collectionService.getCollection();
        $scope.types = [{desc: "Phrase & Definition", type: "pd"},
            {desc: "Multiple Choice", type: "mc"},
            {desc: "True/False", type: "tf"}];
        $scope.defaultType = "mc";
        $scope.move = {};

        $scope.files = [];

        $scope.clickedSave = false;

        if (!subjectService.getSubject()) {
            $location.path("/subjects/" + $routeParams.subjectId)
        }

        if (!$scope.collection) {
            if ($routeParams.collectionId == 'new') {
                $scope.collection = {
                    name: '',
                    exercises: [],
                    public: true
                }
            } else {
                $location.path("/subjects/" + $routeParams.subjectId)
            }
        }
        $scope.exercises = $scope.collection.exercises;

        if ($scope.exercises.length) {
            var index = parseInt($scope.exercises.length) - 1;
            $scope.defaultType = $scope.exercises[index].type;
        }


        //handles refresh
        window.onbeforeunload = function (evt) {
            var message = 'Er du sikker på at du vil forlate?';
            if (typeof evt == 'undefined') {
                evt = window.event;
            }
            if (evt) {
                evt.returnValue = message;
            }
            return message;
        };

        $scope.$on("$routeChangeStart", function (event, next, current) {
            if (!$scope.clickedSave) {
                if (!(next.$$route.originalPath.indexOf('/login') > -1)) {
                    if (!confirm("Alle endringer vil bli forkastet. Er du sikker på at du vil forlate denne siden? ")) {
                        event.preventDefault();
                    }
                }

            }
        });

        $scope.onChangeHandler = function (exercise) {
            return function (e, fileObjects) {
                if (fileObjects) {
                    exercise.image = fileObjects;
                }
            }
        };



        $scope.backToSubjectPage = function(){
            $location.path('/subjects/' + subjectService.getSubject()._id);
        }


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


        $scope.changeDefault = function (exercise, index) {
            $scope.defaultType = exercise.type;
        };

        $scope.addExercise = function () {
            var exercise = {
                "question": "",
                "correctAnswer": "",
                "type": $scope.defaultType
            };

            $scope.collection.exercises.push(exercise);
            $scope.activeExercise = $scope.collection.exercises.length - 1;
        };

        $scope.deleteExercise = function (index) {
            if (index > -1) {
                $scope.exercises.splice(index, 1);
            }
            $scope.activeExercise = undefined
        };

        $scope.moveExcercise = function (index, up) {
            if (up) {
                $scope.collection.exercises.splice(index - 1, 0, $scope.collection.exercises[index]);
                $scope.collection.exercises.splice(index + 1, 1)
            } else {
                $scope.collection.exercises.splice(index + 2, 0, $scope.collection.exercises[index]);
                $scope.collection.exercises.splice(index, 1)
            }
        };

        $scope.saveCollection = function () {
            $scope.saveClicked = true;
            $scope.clickedSave = true;

            var sendExercises = function (exercise) {
                exercise.collaborators = exercise.collaborators || [$cookies.getObject('username')];
                if (exercise.collaborators.indexOf($cookies.getObject('username')) == -1) {
                    exercise.collaborators.push($cookies.getObject('username'))
                };

                if (exercise.type == "mc") {
                    if (!exercise.alternatives) {
                        exercise.alternatives = [];
                    }
                    exercise.correctAnswer = exercise.correctAnswer.toString()
                    exercise.alternatives = exercise.alternatives.filter(Boolean);

                    validateExercise(mcSchema, exercise)
                } else if (exercise.type == "pd") {
                    if (!exercise.tags) {
                        exercise.tags = [];
                    } else {
                        if (exercise.tags.length > 0 && typeof exercise.tags[0] == "object") {
                            exercise.tags = exercise.tags.map(function (tag) {
                                return tag.text
                            })
                        }
                    }
                    ;
                    exercise.correctAnswer = exercise.correctAnswer.toString();
                    validateExercise(pdSchema, exercise)
                } else if (exercise.type == "tf") {
                    validateExercise(tfSchema, exercise)
                };

            };
            var imageUploads = [];


            angular.forEach($scope.exercises, function (exercise) {
                if (exercise.image && !exercise.image.url) {
                    var data = {
                        filetype: exercise.image[0].filetype,
                        base64: exercise.image[0].base64,
                        subjectId: subjectService.getSubject()._id
                    };
                    imageUploads.push(requestService.putImage(data, function (response) {
                        console.log(response);
                        exercise.image = {
                            url: response.url
                        }
                    }))
                }
            });
            $q.all(imageUploads).then(function () {

                angular.forEach($scope.exercises, function (exercise) {
                    sendExercises(exercise)
                });

                if ($routeParams.collectionId == "new") {
                    subjectService.getSubject().collections.push($scope.collection);
                }
                var data = {
                    subject: subjectService.getSubject()
                };
                requestService.httpPut(subjectService.getSubject()._id, data)
                    .then(function () {
                        $location.path('/subjects/' + subjectService.getSubject()._id);
                    }, function (response) {
                        $scope.saveClicked = false;
                        if ($routeParams.collectionId == "new") {
                            subjectService.getSubject().collections.splice(subjectService.getSubject().collections.length - 1, 1)
                        }

                        $scope.errorList = [];
                        $scope.errorMsg = '';
                        for (var j = 0; j < response.errors.length; j++) {
                            var error = response.errors[j].dataPath.split('.');
                            console.log(error);
                            if (error.length > 0) {
                                if (error[3] == 'name') {
                                    $scope.errorMsg += "Manglende navn på settet\n";
                                }
                                else if (error[3].indexOf("exercises") > -1) {
                                    var index = parseInt(error[3].substr(10, 10).substr(0, 1)) + parseInt(j);
                                    var realIndex = parseInt(index + 1);
                                    $scope.errorList.push(index);
                                    $scope.errorMsg += "Feil i oppgavenr " + realIndex + "\n";
                                }
                                else {
                                    $scope.errorMsg += 'En feil oppsto\n'
                                }
                            }
                        }

                        alertify.error($scope.errorMsg);
                    })
            });

        };

        $scope.isInErrorList = function (index) {
            if (!$scope.errorList) {
                return false
            }
            return $scope.errorList.indexOf(index) != -1;
        };
        $scope.list = [];

        for (var i = 0; i < $scope.exercises.length; i++) {
            if ($scope.exercises[i].type == "pd") {
                var len = $scope.exercises[i].tags.length;
                for (j = 0; j < len; j++) {
                    var tag = $scope.exercises[i].tags[j];
                    if ($scope.list.indexOf(tag) == -1) {
                        $scope.list.push(tag);
                    }
                }
            }
        }
        ;


        $scope.getTagSuggestions = function () {
            return $scope.list;
        };

        $scope.activateEditExercise = function (index) {
            $scope.activeExercise = index;
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

        $scope.removeImage = function (exercise) {
            delete exercise.image;
            document.getElementById('imageBox').value = ''
        };


        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id
            },
            containment: "#editArea",
            allowDuplicate: true,
            orderChanged: function (event) {
                if (event.source.index == $scope.activeExercise) {
                    $scope.activeExercise = event.dest.index;
                } else {
                    $scope.activeExercise = undefined
                }
            },
            dragMove: function (itemPosition, containment, eventObj) {
                if (eventObj) {
                    var targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);
                    if (targetY + 200 > $window.innerHeight) {
                        $window.scrollBy(0, 50);
                    } else if (targetY < 100) {
                        $window.scrollBy(0, -50);
                    }
                }
            }

        };

        $scope.openExerciseModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "exerciseModal.html",
                controller: "exerciseModalCtrl",
                windowClass: "app-modal-window",
                resolve: {
                    exercises: function () {
                        return $scope.exercises
                    }
                }
            });

            modalInstance.result.then(function (exercises) {
                angular.forEach(exercises, function (exercise) {
                    if (exercise.type == "mc") {
                        exercise.correctAnswer = exercise.correctAnswer.toString();
                        validateExercise(mcSchema, exercise);
                    } else if (exercise.type == "pd") {
                        exercise.correctAnswer = exercise.correctAnswer.toString();
                        validateExercise(pdSchema, exercise);
                    } else if (exercise.type == "tf") {
                        validateExercise(tfSchema, exercise)
                    }
                    delete exercise._id;
                    $scope.exercises.push(exercise)

                })

            })
        }


    })
    .controller('exerciseModalCtrl', function ($scope, $http, $uibModalInstance, exercises, apiUrl, collectionService) {
        $scope.exercises = [];
        $scope.searchMode = "exercises";
        $scope.navigationParts = [{
            text: "Oppgaver:"

        }];
        $scope.removeExercise = function (index) {
            $scope.exercises.splice(index, 1);
            $scope.searchItems();
        };
        $scope.removeAllExercises = function () {
            $scope.exercises = [];
            $scope.searchItems();
        };
        $scope.changeNavigationParts = function () {
            if ($scope.navigationParts.length == 1) {
                if ($scope.searchMode == 'exercises') {
                    $scope.navigationParts = [{
                        text: "Oppgaver:"

                    }];
                } else if ($scope.searchMode == 'collections') {
                    $scope.navigationParts = [{
                        text: "Sett:"

                    }];
                } else if ($scope.searchMode == 'subjects') {
                    $scope.navigationParts = [{
                        text: "Fag:"
                    }];
                }


            }
        };

        $scope.searchItems = function (collection, subject) {
            if (collection) {
                $scope.navigationParts = [{
                    text: "Sett:" + collection.collectionName + ", Søk: " + $scope.searchTerm,
                    collection: collection
                }, {
                    text: "Oppgaver:",
                    searchTerm: angular.copy($scope.searchTerm),
                    searchMode: angular.copy($scope.searchMode)

                }];
                $scope.searchTerm = "";
            } else if (subject) {
                $scope.navigationParts = [{
                    text: "Fag:" + subject.subjectName + ", Søk: " + $scope.searchTerm,
                    subject: subject
                }, {
                    text: "Oppgaver:",
                    searchTerm: angular.copy($scope.searchTerm),
                    searchMode: angular.copy($scope.searchMode)
                }];
                $scope.searchTerm = "";
            } else {
                if ($scope.navigationParts.length == 2) {
                    collection = $scope.navigationParts[0].collection;
                    subject = $scope.navigationParts[0].subject
                }
            }


            $scope.resultList = [];
            var exerciseIds = $scope.exercises.map(function (exercise) {
                return exercise._id
            });
            $http({
                url: apiUrl + "/search?search=" + $scope.searchTerm
                + (collection ? "&collectionId=" + collection.collectionId : "") + (subject ? "&subjectId=" + subject.subjectId : ""),
                method: 'GET'
            }).success(function (response) {
                $scope.noResult = response.length ? false : true;
                var resultListIds = [];
                angular.forEach(response, function (item) {
                    if ($scope.searchMode == 'exercises' || collection || subject) {
                        if (exerciseIds.indexOf(item.exercise._id) == -1) {
                            if (!collectionService.getCollection()) {
                                $scope.resultList.push(item.exercise)
                            } else {
                                if (item.collection._id != collectionService.getCollection()._id) {
                                    $scope.resultList.push(item.exercise)
                                }
                            }
                        }
                    } else {
                        var newItem = {};
                        if ($scope.searchMode == 'collections') {
                            newItem = {
                                collectionId: item.collection._id,
                                collectionName: item.collection.name,
                                subjectCode: item.subject.code,
                                subjectName: item.subject.name

                            };
                            if (resultListIds.indexOf(item.collection._id) == -1) {
                                if (!collectionService.getCollection()) {
                                    $scope.resultList.push(newItem);
                                    resultListIds.push(item.collection._id)
                                } else {
                                    if (item.collection._id != collectionService.getCollection()._id) {
                                        $scope.resultList.push(newItem);
                                        resultListIds.push(item.collection._id)
                                    }
                                }
                            }
                        } else if ($scope.searchMode == "subjects") {

                            newItem = {
                                subjectId: item.subject._id,
                                subjectName: item.subject.name,
                                subjectCode: item.subject.code
                            };
                            if (resultListIds.indexOf(item.subject._id) == -1) {
                                $scope.resultList.push(newItem);
                                resultListIds.push(item.subject._id)

                            }
                        }
                    }

                })

            })
        };

        $scope.resetSearch = function () {
            $scope.navigationParts.splice(0, 1);
            $scope.searchTerm = $scope.navigationParts[0].searchTerm;
            $scope.searchMode = $scope.navigationParts[0].searchMode;
            $scope.changeNavigationParts()
            $scope.searchItems()
        };

        $scope.addAllToList = function () {
            angular.forEach($scope.resultList, function (exercise) {
                $scope.exercises.push(exercise)
            });
            $scope.searchItems();
        };

        $scope.addExercises = function () {
            $uibModalInstance.close($scope.exercises);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
        };

        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            allowDuplicate: true,
            ctrlClone: true,
            containment: "#exercises-container"

        };

        $scope.dragControlListeners2 = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return true
            },
            allowDuplicate: true,
            ctrlClone: true,
            containment: "#exercises-container"

        };
    });