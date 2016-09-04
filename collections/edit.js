angular.module('myApp.edit', ['ngRoute'])
    .controller('editCtrl', function ($scope, $cookies, $window, $document, $http, $routeParams, $timeout,
                                      $location, $q, $uibModal, $rootScope, collectionService, subjectService, requestService, apiUrl,alertify) {
        var ajv = new Ajv({removeAdditional: true});
        var validateExercise = function (schema, object) {
            return ajv.validate(schema, object);
        };


        $scope.collection = $routeParams.collectionId == 'new' ? undefined : collectionService.getCollection();
        $scope.types = [{desc: "Phrase-Definition", type: "pd"},
            {desc: "Multiple Choice", type: "mc"},
            {desc: "True/False", type: "tf"}];
        $scope.typeDesc = {
            pd: "Phrase-Definition",
            mc: "Multiple Choice",
            tf: "True/False"
        };
        $scope.defaultType = "mc";
        $scope.move = {};

        $scope.files = [];
        $scope.clickedSave = false;
        $scope.extraProperty = {};
        window.localStorage.setItem('refreshed', false);

        if (!subjectService.getSubject()) {
            window.localStorage.setItem('refreshed', true);
            $location.path("/subjects/" + $routeParams.subjectId)

        }

        if (!$scope.collection) {
            if ($routeParams.collectionId == 'new') {
                $scope.collection = {
                    name: '',
                    exercises: [],
                    public: true
                };
            } else {
                $location.path('/subjects/' + $routeParams.subjectId)
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
        window.onunload = function () {
            window.localStorage.setItem('refreshed', true);
        }

        $scope.$on("$routeChangeStart", function (event, next, current) {
            if (!$scope.clickedSave) {
                if (!(next.$$route.originalPath.indexOf('/login') > -1)) {
                    if(window.localStorage.getItem('refreshed') == 'false') {
                        if (!confirm("Alle endringer vil bli forkastet. Er du sikker på at du vil forlate denne siden? ")) {
                            event.preventDefault();
                        }
                    }
                }

            }
        });

        $scope.onChangeHandler = function (exercise) {
            return function (e, fileObjects) {
                if (fileObjects) {
                    exercise.question.image = fileObjects;
                }
            }
        };



        $scope.backToSubjectPage = function(){
            $location.path('/subjects/' + subjectService.getSubject()._id);
        }


        $scope.addAlternative = function (exercise, corrects) {
            if(corrects) {
                if (!exercise.corrects) {
                    exercise.corrects = [];
                }
                exercise.corrects.push({answer: ""})

            } else {
                if (!exercise.wrongs) {
                    exercise.wrongs = [];
                }
                exercise.wrongs.push({answer: ""})
            }


        };

        $scope.deleteAlternative = function (exercise, index, corrects) {
            if(corrects) {
                if (index > -1) {
                    exercise.corrects.splice(index, 1);
                }
            } else {
                if (index > -1) {
                    exercise.wrongs.splice(index, 1);
                }
            }
        };


        $scope.changeDefault = function (exercise, index) {
            $scope.defaultType = exercise.type;
            if(exercise.type == 'mc') {
                if(!exercise.corrects) {
                    exercise.corrects = [{answer: ""}];
                }
                if(!exercise.wrongs) {
                    exercise.wrongs = [{answer: ""}];
                }
            }
        };

        $scope.addExercise = function () {
            var exercise = {
                "question": {},
                "type": $scope.defaultType
            };
            if(exercise.type == 'mc') {
                exercise.corrects = [{answer: ""}];
                exercise.wrongs = [{answer: ""}];
            } else if (exercise.type == 'pd') {
                exercise.correct = {};
            } else if(exercise.type == 'tf') {
                exercise.correct = {};
            }
            $scope.collection.exercises.push(exercise);
            $timeout(function () {
                window.scrollTo(0, document.body.scrollHeight);
            }, 0);
            $scope.choseActiveExercise($scope.collection.exercises.length - 1);
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
                    if (!exercise.wrongs) {
                        exercise.wrongs = [];
                    }
                    //exercise.wrongs = exercise.wrongs.filter(Boolean);
                    var alternativeRemoveList = [];
                    angular.forEach(exercise.wrongs, function (alternative, index) {
                        if(!alternative.answer.length > 0) {
                            alternativeRemoveList.push(index)
                        }
                    });
                    var removedCount = 0;
                    angular.forEach(alternativeRemoveList, function (index) {
                        exercise.wrongs.splice(index-removedCount, 1);
                        removedCount += 1;
                    });

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
                    exercise.correct.answer = exercise.correct.answer.toString();
                    validateExercise(pdSchema, exercise)
                } else if (exercise.type == "tf") {
                    validateExercise(tfSchema, exercise)
                };

            };
            var imageUploads = [];


            angular.forEach($scope.exercises, function (exercise) {
                if (exercise.question.image && !exercise.question.image.url) {
                    var data = {
                        filetype: exercise.question.image[0].filetype,
                        base64: exercise.question.image[0].base64,
                        subjectId: subjectService.getSubject()._id
                    };
                    imageUploads.push(requestService.putImage(data, function (response) {
                        console.log(response);
                        exercise.question.image = {
                            url: response.secure_url
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
                        console.log($scope.collection)
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

        $scope.choseActiveExercise = function (index) {
            if(index != $scope.activeExercise) {
                $scope.extraProperty = {};
                var filterAlternativeArray = function (array) {
                    var alternativeRemoveList = [];
                    for(var i=1; i < array.length; i++) {
                        if(!array[i].answer.length > 0) {
                            alternativeRemoveList.push(i)
                        }
                    }
                    var removedCount = 0;
                    angular.forEach(alternativeRemoveList, function (index) {
                        array.splice(index-removedCount, 1);
                        removedCount += 1;
                    });
                };
                if($scope.activeExercise != undefined && $scope.exercises[$scope.activeExercise].wrongs) {
                    //$scope.exercises[$scope.activeExercise].wrongs = $scope.exercises[$scope.activeExercise].wrongs.filter(Boolean)
                    filterAlternativeArray($scope.exercises[$scope.activeExercise].wrongs)
                };
                if($scope.activeExercise != undefined && $scope.exercises[$scope.activeExercise].corrects) {
                    filterAlternativeArray($scope.exercises[$scope.activeExercise].corrects)
                };
            }
            $scope.activeExercise = index;
        };

        $scope.getExerciseTags = function (exercise) {
            if (!exercise.tags || exercise.tags.length == 0) {
                return
            }

            if (typeof exercise.tags[0] == "string") {
                return exercise.tags
            } else {
                return exercise.tags.map(function (tag) {
                    return tag.text
                })
            }
        };


        $scope.getImage = function (image) {
            if (!image.url) {
                return ("data:" + image[0].filetype + ";base64, " + image[0].base64);
            } else {
                var imageUrlParts = image.url.split('/');
                imageUrlParts[imageUrlParts.indexOf("upload") + 1] = "h_140";
                imageUrlParts.splice(0, 2);
                var newUrl = "https:/";
                angular.forEach(imageUrlParts, function (part) {
                    newUrl = newUrl + "/" + part
                });
                return newUrl;
            }
        };

        $scope.removeImage = function (index) {
            delete $scope.collection.exercises[index].question.image;
            if(document.getElementById(index)) {
                document.getElementById(index).value = ''
            }
        };


        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id
            },
            containment: "#editArea",
            allowDuplicate: true,
            orderChanged: function (event) {
                if (event.source.index == $scope.activeExercise) {
                    $scope.extraProperty[event.dest.index] = $scope.extraProperty[event.source.index];
                    $scope.activeExercise = event.dest.index;
                } else {
                    $scope.activeExercise = undefined
                }
            },
            dragMove: function (itemPosition, containment, eventObj) {
                if (eventObj) {
                    var targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);
                    if (targetY + 150 > $window.innerHeight) {
                        $window.scrollBy(0, 40);
                    } else if (targetY < 150) {
                        $window.scrollBy(0, -40);
                    }
                }
            }

        };

        $scope.openExerciseModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "exerciseModal.html",
                controller: "exerciseModalCtrl",
                windowClass: "app-modal-large",
            });

            modalInstance.result.then(function (exercises) {
                angular.forEach(exercises, function (exercise) {
                    // if (exercise.type == "mc") {
                    //     exercise.correct.answer = exercise.correct.answer.toString();
                    //     validateExercise(mcSchema, exercise);
                    // } else if (exercise.type == "pd") {
                    //     exercise.correct.answer = exercise.correct.answer.toString();
                    //     validateExercise(pdSchema, exercise);
                    // } else if (exercise.type == "tf") {
                    //     validateExercise(tfSchema, exercise)
                    // }
                    // ---- Steps above might not be necessary------
                    delete exercise._id;
                    $scope.exercises.push(exercise)

                })

            })
        };


    })
    .controller('exerciseModalCtrl', function ($scope, $http, $uibModalInstance, $routeParams, apiUrl, collectionService) {
        $scope.exercises = [];
        $scope.resultList = [];
        $scope.searchMode = "exercises";
        $scope.disabledList = [];
        $scope.navigationParts = [{
            text: "Oppgaver:"

        }];
        $scope.removeExercise = function (index) {
            $scope.exercises.splice(index, 1);
            $scope.disabledList.splice(index, 1);
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
                console.log($scope.resultList);
                var resultListIds = [];
                angular.forEach(response, function (item) {
                    if ($scope.searchMode == 'exercises' || collection || subject) {
                        if ($routeParams.collectionId != "new") {
                            if (item.collection._id != collectionService.getCollection()._id) {
                                $scope.resultList.push(item.exercise);
                            }
                        };

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
                                if ($routeParams.collectionId == 'new') {
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

                });
                $scope.noResult = $scope.resultList.length ? false : true;

            })
        };
        $scope.isInDisabledList = function (index) {
            if($scope.disabledList.indexOf($scope.resultList[index]._id) != -1) {
                return true;
            }
            return false
        };
        $scope.resetSearch = function () {
            $scope.navigationParts.splice(0, 1);
            $scope.searchTerm = $scope.navigationParts[0].searchTerm;
            $scope.searchMode = $scope.navigationParts[0].searchMode;
            $scope.changeNavigationParts();
            $scope.searchItems()
        };
        $scope.addToList = function (index) {
            $scope.exercises.push($scope.resultList[index]);
            $scope.disabledList.push($scope.resultList[index]._id);
        };

        $scope.addAllToList = function () {
            angular.forEach($scope.resultList, function (exercise) {
                $scope.exercises.push(exercise)
            });
            $scope.searchItems();
        };


        $scope.returnExercises = function () {
            $uibModalInstance.close($scope.exercises);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
        };

        $scope.resultsAreExercises = function () {
            if($scope.resultList.length > 0 && $scope.resultList[0].question) {
                return true;
            }
            return false;
        };

        // $scope.dragControlListeners = {
        //     accept: function (sourceItemHandleScope, destSortableScope) {
        //         return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
        //     },
        //     allowDuplicates: true,
        //     clone: true
        // };
        //
        // $scope.dragControlListeners2 = {
        //     accept: function (sourceItemHandleScope, destSortableScope) {
        //         return true
        //     },
        //     allowDuplicates: false
        // };
    });