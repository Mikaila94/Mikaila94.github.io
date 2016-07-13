angular.module('myApp.collections', ['ngRoute'])


    .controller('collectionsCtrl', function ($scope, $cookies, $http, $routeParams, subjectService, collectionService, apiUrl) {
        var initCollections = function(collections) {
            $scope.collections = collections;
            $scope.subject.collections = collections;
        };
        $scope.subject = subjectService.getSubject();

        if(!$scope.subject) {
            $http({
                url: apiUrl + "/subjects/" + $routeParams.subjectId,
                method: "GET"
            }).success(function(response){
                console.log(response);

                //$scope.subject = {
                //    _id: response._id,
                //    code: response.code,
                //    name: response.name,
                //    collections: response.collections
                //};
                //console.log({"moren din":$scope.subject});
                //
                //subjectService.setSubject($scope.subject);
                //initCollections(response.collections);
            })
        } else {
            $http({
                url: apiUrl + "/subjects/" + $scope.subject._id,
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
            $http({
                url:  apiUrl + '/subjects/' + subjectService.getSubject()._id +  "/collections/" + coll._id,
                method: 'DELETE',
                headers: {'x-access-token': $cookies.getObject("token")}
            }).success(function(response,status){
                console.log("response" + response + "\n\n\n\nstatus" + status);
                if(index > -1){
                    $scope.collections.splice(index,1)
                }
            }).error(function(data,status,header,config){
                $scope.ServerResponse =  htmlDecode("Data: " + data +
                    "\n\n\n\nstatus: " + status +
                    "\n\n\n\nheaders: " + header +
                    "\n\n\n\nconfig: " + config);
            });

        };




    })

    .controller('editCtrl', function ($scope, $cookies,$timeout,$window,$http,$routeParams,$location, $q, collectionService, subjectService, focus, apiUrl,RestService) {

        $scope.public = true;
        $scope.collection = collectionService.getCollection();

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


        $scope.types = [{desc: "Phrase & Definition", type: "pd"},
            {desc: "Multiple Choice", type: "mc"},
            {desc: "True/False", type: "tf"}];

        $scope.updateAlternative = function (exercise, index, alternative) {
            exercise.alternatives[index] = alternative
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

        $scope.defaultType = "mc";
        if ($scope.exercises.length) {
            var index = parseInt($scope.exercises.length) - 1;
            $scope.defaultType = $scope.exercises[index].type;
        }


        $scope.changeDefault = function (exercise, index) {
            $scope.defaultType = exercise.type;
        };

        var typeBox = document.getElementById("typeBox");

        $scope.addExercise = function () {

            var exercise = {
                "question": "",
                "correctAnswer": "",
                "type": $scope.defaultType
            };
            console.log(exercise.type)
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

        $scope.saveCollection = function () {
            console.log("hei " + $routeParams.collectionId);
            if ($routeParams.collectionId == "new") {
                console.log({"sdfdsf": subjectService.getSubject()});
                subjectService.getSubject().collections.push($scope.collection);
                RestService.postSubject();
            }
            else {
                RestService.putSubject();
            }
        };


        $scope.list = [];

        for (var i = 0; i < $scope.exercises.length; i++) {
            if($scope.exercises[i].type == "pd") {
                console.log($scope.exercises[i]);
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



    });