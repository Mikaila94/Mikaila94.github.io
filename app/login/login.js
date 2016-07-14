angular.module('myApp.login', ['ngRoute', 'base64'])


    .controller('loginCtrl', function ($scope, $http, $cookies, $base64, $location, apiUrl) {


        $scope.authenticate =function () {
            $http({
                url: apiUrl + '/users/authentication',
                method: "POST",
                data: {
                    user: {
                        username: $scope.username,
                        password: $scope.password
                    }
                }

            }).success(function (response) {
                console.log(response)
                $cookies.putObject('token', {
                    'x-access-token': response.token
                });
                $cookies.putObject('username', $scope.username);
                $cookies.putObject('password', $scope.password);
                console.log($cookies.getObject('token'));
                $location.path('/subjects')

            }).error(function (response, status) {
                console.log(response, status)
            })
        }

    })
    .controller('registerCtrl', function ($scope, $http, $location, apiUrl) {
        $scope.user = {};
        $scope.completeRegister = function () {
            if($scope.user.email && $scope.user.username && $scope.user.password) {
                if($scope.user.password != $scope.controlPassword ) {
                    alert("feil")
                } else {
                    $http({
                        url: apiUrl + "/users",
                        method: "POST",
                        data: {
                            user: $scope.user
                        }
                    }).success(function (response) {
                        $location.path('/login')
                    }).error(function (response, status) {
                        console.log(response, status)
                    })
                }


            } else {
                alert("du må fylle ut alle, din tælling")
            }
        }
    });
