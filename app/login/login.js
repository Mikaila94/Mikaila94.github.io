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
                $cookies.putObject('token', {
                    'x-access-token': response.token
                });
                $cookies.putObject('username', $scope.username);
                $cookies.putObject('password', $scope.password);
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
                    $scope.error = true;
                    $scope.errorMessage = "*Passord og bekreftelse av passord stemmer ikke overens"
                } else {
                    $http({
                        ignoreLoadingBar:true,
                        url: apiUrl + "/users",
                        method: "POST",
                        data: {
                            user: $scope.user
                        }
                    }).success(function (response) {
                        $location.path('/login')
                    }).error(function (response, status) {
                        console.log(response, status)
                        $scope.error = true;
                        $scope.errorMessage = response.errors ? "*Feil format på utfyllingsskjema" : "*Brukernavn finnes fra før"
                    })
                }


            } else {
                $scope.error = true;
                $scope.errorMessage = "*Alle feltene må fylles ut"
            }
        }
    });
