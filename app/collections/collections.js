angular.module('myApp.collections', ['ngRoute'])


    .controller('collectionsCtrl', function ($scope, $cookies, $http, $routeParams, subjectService, collectionService, requestService, apiUrl) {
        var initCollections = function(response) {
            $scope.collections = response.collections;
            $scope.subject.collections = response.collections;
            $scope.subject.public = response.public
        };
        $scope.subject = subjectService.getSubject();


        requestService.httpGet("/subjects/" + $routeParams.subjectId + "?editor=true")
            .then(function (response) {
                if(!$scope.subject) {
                    $scope.subject = response;
                    subjectService.setSubject($scope.subject);
                }
                initCollections(response);
            });


        $scope.setTargetCollection = function (target) {
            $scope.targetCollection = target._id;
            collectionService.setCollection(target)
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
            requestService.httpPut($scope.subject._id, data)
                .then(function (response) {
                    alert("lagret   ")
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
                }
                ;
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
                        if (error.length > 0) {
                            if (error[2] == 'name') {
                                $scope.errorMsg += "Manglende navn på settet\n";
                            }
                            else if(error[2].indexOf("exercises") > -1){
                                var index = parseInt(error[2].substr(10,10).substr(0,1)) + parseInt(j);
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
        }

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
                        $window.scrollBy(0, 20);
                    } else if (targetY < 100) {
                        $window.scrollBy(0, -20);
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
            })
        }


    })
    .controller('exerciseModalCtrl', function ($scope, $http, $uibModalInstance, exercises, apiUrl) {
        $scope.exercises = [];
        $scope.searchMode = "exercises";
        $scope.removeExercise = function (index) {
            $scope.exercises.splice(index, 1);
            $scope.searchItems();
        };

        $scope.searchItems = function () {
            $scope.resultList = [];
            var exerciseIds = $scope.exercises.map(function (exercise) {
                return exercise._id
            });
            $http({
                url: apiUrl + "/search?search=" + $scope.searchTerm,
                method: 'GET'
            }).success(function (response) {
                $scope.noResult = response.length ? false:true;
                angular.forEach(response, function (item) {
                    if(exerciseIds.indexOf(item.exercise._id) == -1) {
                        $scope.resultList.push(item.exercise)
                    }
                })
            })
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