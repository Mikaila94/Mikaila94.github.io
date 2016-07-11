
angular.module('myApp.collections', ['ngRoute'])


    .controller('collectionsCtrl', function ($scope, $http, $routeParams, subjectService, collectionService, apiUrl) {
        var initCollections = function(collections) {
            $scope.collections = collections

        };
        $scope.subject = subjectService.getSubject();
        $scope.defaultValue = "pd";

        if(!$scope.subject) {
            $http({
                url: apiUrl + "/" + $routeParams.subjectId,
                method: "GET",
                params: {"environment": "production"}
            }).success(function(response){
                $scope.subject = {
                    _id: response._id,
                    code: response.code,
                    name: response.name
                };
                subjectService.setSubject($scope.subject)
                initCollections(response.collections);
            })
        } else {
            $http({
                url: apiUrl + "/" + $scope.subject._id,
                method: "GET",
                params: {"environment": "production"}
            }).success(function (response) {
                initCollections(response.collections);
            })
        }

        $scope.setTargetCollection = function (target) {
            $scope.targetCollection = target.name.replace(/[^a-zA-Z 0-9]/g, "").replace(/ /g, '');
            collectionService.setCollection(target)
        };




    })

    .controller('editCtrl', function ($scope, $timeout,$window,$http,$routeParams,$location, $anchorScroll, collectionService, subjectService, apiUrl) {

        $scope.gotoBottom = function () {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash("bottom");

            // call $anchorScroll()
            $timeout(function(){
                $anchorScroll();

            },5);
        };

        $scope.collection = collectionService.getCollection();
        $scope.collectionPrivate="";
        $scope.collectionPublic="";
        if(!$scope.collection) {
            window.history.back()
        }
        console.log($scope.collection);
        $scope.exercises = $scope.collection.exercises;



        $scope.types=[{desc:"Phrase & Definition", type: "pd"},
            {desc:"Multiple Choice", type: "mc"},
            {desc:"True/False", type: "tf"}];

        $scope.updateAlternative = function(exercise, index, alternative) {
            exercise.alternatives[index] = alternative
        };
        $scope.addAlternative = function(exercise){
            if(!exercise.alternatives) {
                exercise.alternatives=[];
            }
            exercise.alternatives.push("")
        };

        $scope.deleteAlternative = function(exercise,index){
            if(index > -1){
                exercise.alternatives.splice(index,1);
            }
        };

        var defaultType = "pd";

        if($scope.exercises.length > 0){
            var index = parseInt($scope.exercises.length) - 1;
            defaultType =  $scope.exercises[index].type;
        }


        $scope.changeDefault = function(exercise,index){
              defaultType = exercise.type;
        };

        var typeBox = document.getElementById("typeBox");
        $scope.addExercise = function ($location){

            var exercise = {
                    "subjectId": subjectService.getSubject()._id,
                    "question": "",
                    "correctAnswer": "",
                    "type": defaultType,
                    "tags": [],
                    "collectionId": collectionService.getCollection()._id,
                    "relatedAlternatives": []
            };

            collectionService.getCollection().exercises.push(exercise);
            $scope.gotoBottom();
        };

        $scope.deleteExercise = function(index){
            if(index > -1){
                collectionService.getCollection().exercises.splice(index,1);
            }
        };

        $scope.list = [];

        for (i = 0; i < $scope.exercises.length; i++) {
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



    })
;