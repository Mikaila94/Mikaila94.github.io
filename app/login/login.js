angular.module('myApp.login', ['ngRoute', 'base64'])


    .controller('loginCtrl', function ($scope, $http, $cookies, $base64, $location, apiUrl) {


        $scope.authenticate =function () {
            $http({
                url: apiUrl + '/authentication',
                method: "GET",
                headers: {
                    Authorization: 'Basic ' +  $base64.encode($scope.username + ":" + $scope.password)
                }

            }).success(function (response) {
                $cookies.putObject('token', response.token);
                $cookies.putObject('username', $scope.username);
                $cookies.putObject('password', $scope.password);
                console.log($cookies.getObject('token'));
                $location.path('/subjects')

            }).error(function (response, status) {
                console.log(response, status)
            })
        }

    });
