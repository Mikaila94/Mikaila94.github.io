angular.module('myApp.collections', ['ngRoute'])


    .controller('collectionsCtrl', function ($scope, $cookies, $http, $routeParams, subjectService, collectionService, requestService, apiUrl) {
        var initCollections = function(collections) {
            $scope.collections = collections;
            $scope.subject.collections = collections;
        };
        $scope.subject = subjectService.getSubject();

        if(!$scope.subject) {
            $http({
                url: apiUrl + "/subjects/" + $routeParams.subjectId + "?editor=true",
                method: "GET"
            }).success(function(response){

                $scope.subject = response;

                subjectService.setSubject($scope.subject);
                initCollections(response.collections);
            })
        } else {
            $http({
                url: apiUrl + "/subjects/" + $scope.subject._id + "?editor=true",
                method: "GET"
            }).success(function (response) {
                initCollections(response.collections);
            })
        }

        $scope.setTargetCollection = function (target) {
            $scope.targetCollection = target.name.replace(/[^a-zA-Z 0-9]/g, "").replace(/ /g, '');
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

    .controller('editCtrl', function ($scope, $cookies,$timeout,$window,$http,$routeParams,$location, $q, collectionService, subjectService, requestService, apiUrl) {

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
            $timeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            }, 0)
        };

        $scope.deleteExercise = function (index) {
            if (index > -1) {
                $scope.exercises.splice(index, 1);
            }
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
                    exercise.alternatives = exercise.alternatives.filter(Boolean);
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
                        tags: exercise.tags.map(function (tag) {
                            return tag.text
                        })
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

                    var msg = '';
                    $scope.errorList = [];

                    for(var j = 0;j<response.errors.length;j++){
                        var error = response.errors[j].dataPath.split('.');
                        if (error.length > 0) {
                            if (error[2] == 'name') {
                                msg += "\nManglende navn på settet";
                            }
                            else{
                                var index = parseInt(error[2].substr(10,10).substr(0,1)) + parseInt(j);
                                $scope.errorList.push(index);
                            }
                        }
                    }

                    if(msg.length == 0){
                        msg = 'Oh snap'
                    };



                    $scope.addAlert( { type: 'danger', msg: msg });
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

        $scope.dragControlListeners = {
            accept: function(sourceItemHandleScope, destSortableScope) {return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id},
            containment: "#editArea",
            allowDuplicate:true

        };


    });