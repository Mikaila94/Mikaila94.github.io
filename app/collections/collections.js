angular.module('myApp.collections', ['ngRoute'])
    .controller('collectionsCtrl', function ($scope, $cookies, $http, $routeParams, subjectService, collectionService, requestService, apiUrl) {
        var initCollections = function(response) {
            $scope.collections = response.collections;
        };

        $scope.subject = subjectService.getSubject();

        requestService.httpGet("/subjects/mine/" + $routeParams.subjectId + "?editor=true")
            .then(function (response) {
                $scope.subject = response;
                console.log(response);
                subjectService.setSubject($scope.subject);
                initCollections(response);
            });

        $scope.setTargetCollection = function (index) {
            subjectService.setSubjectToCopy(subjectService.getSubjectCopy());
            $scope.subject = subjectService.getSubject();
            $scope.targetCollection = $scope.subject.collections[index]._id;
            console.log($scope.subject);
            console.log(subjectService.getSubject())
            collectionService.setCollection($scope.subject.collections[index])
        };

        $scope.deleteCollection = function(coll,index){

            $scope.subject.collections.splice(index, 1);

            var data = {
                subject: $scope.subject
            };
            requestService.httpPut($scope.subject._id, data);

        };

        $scope.saveSubject = function () {
            var data = {
                subject: $scope.subject
            };
            console.log(data);
            requestService.httpPut($scope.subject._id, data)
                .then(function (response) {
                    alert("lagret   ")
                    subjectService.setSubject($scope.subject);
                })
        };

        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            containment: '#collectionsTable'
        }

    })
    .controller('editCtrl', function ($scope, $cookies,$timeout,$window, $document,$http,$routeParams,$location, $q, $uibModal, collectionService, subjectService, requestService, apiUrl) {
        $scope.public = true;
        $scope.collection = $routeParams.collectionId == 'new' ? undefined : collectionService.getCollection();
        $scope.types = [{desc: "Phrase & Definition", type: "pd"},
            {desc: "Multiple Choice", type: "mc"},
            {desc: "True/False", type: "tf"}];
        $scope.defaultType = "mc";
        $scope.move = {};
        var alertElement = document.getElementById('alertElement');

        $scope.alerts = [];
        $scope.files = [];



        $scope.onChangeHandler = function(exercise) {
            return function (e, fileObjects) {
                if (fileObjects) {
                    var data = {
                        filetype: fileObjects[0].filetype,
                        base64: fileObjects[0].base64,
                        subjectId: subjectService.getSubject()._id
                    };
                    requestService.putImage(data).then((res) =>{
                        console.log(res);
                        exercise.image = {url: res.url};
                        }, (err) =>{
                            console.log(err);
                    });

                }
            }
        };


        $scope.addAlert = function(element) {
            $scope.alerts.push(element);
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


        if (!subjectService.getSubject()) {
            $location.path("/subjects/" + $routeParams.subjectId)
        }

        if (!$scope.collection) {
            if ($routeParams.collectionId == 'new') {
                $scope.collection = {
                    name: '',
                    exercises: [],
                    public: $scope.public
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
            $scope.activeExercise = $scope.collection.exercises.length-1;
            $timeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            }, 0)
        };

        $scope.deleteExercise = function (index) {
            if (index > -1) {
                $scope.exercises.splice(index, 1);
            }
            $scope.activeExercise = undefined
        };

        $scope.moveExcercise = function (index, up) {
            if(up) {
                $scope.collection.exercises.splice(index-1, 0, $scope.collection.exercises[index]);
                $scope.collection.exercises.splice(index+1, 1)
            } else {
                $scope.collection.exercises.splice(index+2, 0, $scope.collection.exercises[index]);
                $scope.collection.exercises.splice(index, 1)
            }
        };

        $scope.saveCollection = function () {
            var exerciseList = [];
            angular.forEach($scope.exercises, function (exercise) {
                var newExercise = {};
                if (exercise.type == "mc") {
                    if(!exercise.alternatives) {
                        exercise.alternatives = [];
                    }
                    exercise.alternatives = exercise.alternatives.filter(Boolean);
                    newExercise = {
                        question: exercise.question,
                        correctAnswer: exercise.correctAnswer.toString(),
                        type: exercise.type,
                        alternatives: exercise.alternatives
                    };
                } else if (exercise.type == "pd") {
                    if(!exercise.tags) {
                        exercise.tags = [];
                    } else {
                        if(exercise.tags.length > 0 && typeof exercise.tags[0] == "object") {
                            exercise.tags = exercise.tags.map(function (tag) {
                                return tag.text
                            })
                        }
                    };

                    newExercise = {
                        question: exercise.question,
                        correctAnswer: exercise.correctAnswer.toString(),
                        type: exercise.type,
                        tags: exercise.tags
                    };
                } else if (exercise.type == "tf") {
                    newExercise = {
                        question: exercise.question,
                        correctAnswer: exercise.correctAnswer,
                        type: exercise.type
                    }
                };
                if(exercise.image) {
                    newExercise.image = exercise.image;
                }
                exerciseList.push(newExercise)
            });
            $scope.collection.exercises = exerciseList;
            $scope.exercises = $scope.collection.exercises;
            if ($routeParams.collectionId == "new") {
                subjectService.getSubject().collections.push($scope.collection);
            }
            var data = {
                subject: subjectService.getSubject()
            };
            console.log(data);
            requestService.httpPut(subjectService.getSubject()._id, data)
                .then(function () {
                    $location.path('/subjects/' + subjectService.getSubject()._id);
                    $scope.addAlert({ type: 'success', msg: 'Well done! You successfully read this important alert message.'});
                    $timeout(function(){
                        if($scope.alerts.length > 0){
                            $scope.closeAlert(0);
                        }
                    },3000);
                }, function (response) {
                    if ($routeParams.collectionId == "new") {
                        subjectService.getSubject().collections.splice(subjectService.getSubject().collections.length - 1, 1)
                    }

                    $scope.errorList = [];
                    $scope.errorMsg = '';

                    for(var j = 0;j<response.errors.length;j++){
                        var error = response.errors[j].dataPath.split('.');
                        console.log(error);
                        if (error.length > 0) {
                            if (error[3] == 'name') {
                                $scope.errorMsg += "Manglende navn på settet\n";
                            }
                            else if(error[3].indexOf("exercises") > -1){
                                var index = parseInt(error[3].substr(10,10).substr(0,1)) + parseInt(j);
                                var realIndex = parseInt(index + 1);
                                $scope.errorList.push(index);
                                $scope.errorMsg += "Feil i oppgavenr " + realIndex + "\n";
                            }
                            else{
                                $scope.errorMsg += 'En feil oppsto\n'
                            }
                        }
                    }



                    $scope.addAlert( { type: 'danger', msg: $scope.errorMsg });
                    $timeout(function(){
                        if($scope.alerts.length > 0){
                            $scope.closeAlert(0);
                        }
                    },3000);
                })
        };

        $scope.isInErrorList = function(index){
            if(!$scope.errorList) {
                return false
            }
            return $scope.errorList.indexOf(index) != -1;
        };
        $scope.list = [];

        for (var i = 0; i < $scope.exercises.length; i++) {
            if($scope.exercises[i].type == "pd") {
                var len = $scope.exercises[i].tags.length;
                for (j = 0; j < len; j++) {
                    var tag = $scope.exercises[i].tags[j];
                    if ($scope.list.indexOf(tag) == -1) {
                        $scope.list.push(tag);
                    }
                }
            }
        };


        $scope.getTagSuggestions = function(){
            return $scope.list;
        };

        $scope.activateEditExercise = function (index) {
            $scope.activeExercise = index;
        };

        $scope.getExerciseTags = function (exercise) {
            if(!exercise.tags || exercise.tags.length == 0) {
                return
            }

            if(typeof exercise.tags[0] == "string") {
                return exercise.tags.toString()
            } else {
                return exercise.tags.map(function (tag) {
                    return tag.text
                }).toString()
            }
        };

        $scope.getImage = function (imageUrl) {
            var imageUrlParts = imageUrl.split('/');
            imageUrlParts[imageUrlParts.indexOf("upload") + 1] = "w_120";
            imageUrlParts.splice(0,2);
            var newUrl = "http:/";
            angular.forEach(imageUrlParts, function (part) {
                newUrl = newUrl + "/" + part
            });
            return newUrl;
        };


        $scope.dragControlListeners = {
            accept: function(sourceItemHandleScope, destSortableScope) {return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id},
            containment: "#editArea",
            allowDuplicate:true,
            orderChanged: function (event) {
                if(event.source.index == $scope.activeExercise) {
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
                    var newExercise = {};
                    if (exercise.type == "mc") {
                        newExercise = {
                            question: exercise.question,
                            correctAnswer: exercise.correctAnswer.toString(),
                            type: exercise.type,
                            alternatives: exercise.alternatives
                        };
                    } else if (exercise.type == "pd") {
                        newExercise = {
                            question: exercise.question,
                            correctAnswer: exercise.correctAnswer.toString(),
                            type: exercise.type,
                            tags: exercise.tags
                        };
                    } else if (exercise.type == "tf") {
                        newExercise = {
                            question: exercise.question,
                            correctAnswer: exercise.correctAnswer,
                            type: exercise.type
                        }
                    }
                    if(exercise.image) {
                        newExercise.image = exercise.image;
                    };
                    $scope.exercises.push(newExercise)

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
        $scope.changeNavigationParts = function () {
            if($scope.navigationParts.length == 1) {
                if($scope.searchMode == 'exercises') {
                    $scope.navigationParts = [{
                        text: "Oppgaver:"

                    }];
                } else if($scope.searchMode == 'collections') {
                    $scope.navigationParts = [{
                        text: "Sett:"

                    }];
                } else if($scope.searchMode == 'subjects') {
                    $scope.navigationParts = [{
                        text: "Fag:"
                    }];
                }


            }
        };

        $scope.searchItems = function (collection, subject) {
            if(collection) {
                $scope.navigationParts = [{
                    text: "Sett:" + collection.collectionName + ", Søk: " + $scope.searchTerm,
                    collection: collection
                },{
                    text: "Oppgaver:",
                    searchTerm: angular.copy($scope.searchTerm),
                    searchMode: angular.copy($scope.searchMode)

                }];
                $scope.searchTerm = "";
            } else if(subject) {
                $scope.navigationParts = [{
                    text: "Fag:" + subject.subjectName + ", Søk: " + $scope.searchTerm,
                    subject: subject
                },{
                    text: "Oppgaver:",
                    searchTerm: angular.copy($scope.searchTerm),
                    searchMode: angular.copy($scope.searchMode)
                }];
                $scope.searchTerm = "";
            } else {
                if($scope.navigationParts.length == 2) {
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
                + (collection ? "&collectionId=" + collection.collectionId: "") + (subject ? "&subjectId=" + subject.subjectId: ""),
                method: 'GET'
            }).success(function (response) {
                $scope.noResult = response.length ? false:true;
                var resultListIds = [];
                angular.forEach(response, function (item) {
                    if($scope.searchMode == 'exercises' || collection || subject) {
                        if(exerciseIds.indexOf(item.exercise._id) == -1) {
                            if(!collectionService.getCollection()) {
                                $scope.resultList.push(item.exercise)
                            } else {
                                if(item.collection._id != collectionService.getCollection()._id ) {
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
                            if(resultListIds.indexOf(item.collection._id) == -1) {
                                if(!collectionService.getCollection()) {
                                    $scope.resultList.push(newItem);
                                    resultListIds.push(item.collection._id)
                                } else {
                                    if(item.collection._id != collectionService.getCollection()._id) {
                                        $scope.resultList.push(newItem);
                                        resultListIds.push(item.collection._id)
                                    }
                                }
                            }
                        } else if($scope.searchMode == "subjects") {

                            newItem = {
                                subjectId: item.subject._id,
                                subjectName: item.subject.name,
                                subjectCode: item.subject.code
                            };
                            if(resultListIds.indexOf(item.subject._id) == -1) {
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
            })
        };

        $scope.addExercises = function () {
            $uibModalInstance.close($scope.exercises);
        };
        
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
        };

        $scope.dragControlListeners = {
            accept: function(sourceItemHandleScope, destSortableScope) {return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;},
            allowDuplicate:true,
            ctrlClone: true,
            containment: "#exercises-container"

        };

        $scope.dragControlListeners2 = {
            accept: function(sourceItemHandleScope, destSortableScope) {return true},
            allowDuplicate:true,
            ctrlClone: true,
            containment: "#exercises-container"

        };
    });