angular.module("myApp.services", ['ngRoute'])
    .service("subjectService", function() {
        var subject;
        var userSubjects;

        var setSubject= function(targetSubject) {
            subject = targetSubject
        };
        var getSubject = function() {
            return subject
        };
        var setUserSubjects = function (subjects) {
            userSubjects = subjects;
        };
        var getUserSubjects = function () {
            return userSubjects;
        };
        return {
            setSubject: setSubject,
            getSubject: getSubject,
            setUserSubjects: setUserSubjects,
            getUserSubjects: getUserSubjects
        }

    })
    .service("collectionService",function(){
        var collection;

        var setCollection = function(targetCollection){
            collection = targetCollection
        };
        var getCollection = function(){
            return collection;
        };



        return{
            setCollection : setCollection,
            getCollection : getCollection

        }


    })
    .service("requestService", function ($http, $q, $cookies, apiUrl) {
        this.httpPut = function (subjectId, data) {
            return $q(function (resolve, reject) {
                $http({
                    ignoreLoadingBar:true,
                    url: apiUrl + '/subjects/' + subjectId,
                    method: 'PUT',
                    headers: $cookies.getObject("token"),
                    data: data
                }).success(function (response, status) {
                    resolve(response);
                }).error(function (response, status, header, config) {
                    console.log(response)
                    console.log(status)
                    console.log(header)
                    console.log(config)
                    reject(response)

                })
            })
        };
        this.httpGet = function (path) {
            return $q(function (resolve, reject) {
                $http({
                    url: apiUrl + path,
                    method: "GET",
                    headers: $cookies.getObject("token")
                }).success(function (response) {
                    resolve(response)
                }).error(function (response, status, header, config) {
                    console.log(response)
                    console.log(status)
                    console.log(header)
                    console.log(config)
                    reject(response)
                })
            })
        }

        
    });
    