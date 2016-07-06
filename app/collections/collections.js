
angular.module('myApp.collections', ['ngRoute'])


    .controller('collectionsCtrl', function ($scope, $http, $routeParams, subjectService, collectionService, apiUrl) {
        var initCollections = function(collections) {
            $scope.collections = collections

        };
        $scope.subject = subjectService.getSubject();
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

    .controller('editCtrl', function ($scope, $http,$routeParams, collectionService, subjectService, apiUrl) {
    //    var initExercises = function (){
    //        $http({
    //            url: apiUrl + '/' + $scope.subject._id,
    //            method: "GET",
    //            params: {"environment":"production"}
    //        }
    //        ).success(function(response){
    //            $scope.collections = response.collections
    //        })
    //}

        $scope.collection = collectionService.getCollection();
        if(!$scope.collection) {
            window.history.back()
        }
        $scope.exercises = $scope.collection.exercises;
        $scope.updateAlternative = function(exercise, index, alternative) {
            exercise.alternatives[index] = alternative
        }
        $scope.addAlternative = function(exercise){
            exercise.alternatives.push("")
        };

        $scope.deleteAlternative = function(exercise,index){
            if(index > -1){
                exercise.alternatives.splice(index,1);
            }
        };





    });