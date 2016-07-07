
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

        $scope.collection = collectionService.getCollection();
        if(!$scope.collection) {
            window.history.back()
        }
        console.log($scope.collection);
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

        var list = [];

        for (i = 0; i < $scope.exercises.length; i++) {
            console.log($scope.exercises[i]);
            var len = $scope.exercises[i].tags.length;
            for(j = 0;j<len;j++){
                var tag = $scope.exercises[i].tags[j];
                if(list.indexOf(tag) == -1){
                    list.push(tag);
                }
            }
        }

        alert(list.length);

        angular.forEach($scope.exercises,function(value,key){
            alert((value,key));
            //angular.forEach(value[key].tags,function(tag){
            //    alert(tag.val());

            //})

        });

        alert(list.length);

        $scope.getTagSuggestions = function(){



            return list;
        };





        //$scope.getTags = function(exercise){
        //    $scope.tags = exercise.tags;
        //}

    });