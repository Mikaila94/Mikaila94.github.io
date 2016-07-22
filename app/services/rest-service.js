angular.module("myApp.services", ['ngRoute'])
    .service("subjectService", function() {
        var subject;
        var userSubjects;
        var subjectCopy;

        var setSubject= function(targetSubject) {
            subject = targetSubject
            subjectCopy = angular.copy(targetSubject)
        };
        var setSubjectToCopy = function(subjectCopy) {
            subject = angular.copy(subjectCopy)

        }
        var getSubject = function() {
            return subject
        };
        var getSubjectCopy = function() {
          return subjectCopy;
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
            getUserSubjects: getUserSubjects,
            getSubjectCopy : getSubjectCopy,
            setSubjectToCopy: setSubjectToCopy
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
                    url: apiUrl + '/subjects/mine/' + subjectId,
                    method: 'PUT',
                    headers: $cookies.getObject("token"),
                    data: data
                }).success(function (response, status) {
                    resolve(response);
                    console.log(response);
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
                    console.log(response);
                    console.log(status);
                    console.log(header);
                    console.log(config);
                    reject(response)
                })
            })
        }

        this.putImage = function(data){
            return $q(function (resolve, reject) {
                $http({
                    url: apiUrl + "/images",
                    method: "POST",
                    headers: $cookies.getObject("token"),
                    data:data
                }).success(function (response) {
                    resolve(response)

                }).error(function (response, status, header, config) {
                    console.log(response);
                    console.log(status);
                    console.log(header);
                    console.log(config);
                    reject(response)
                })
            })
        }

        
    });
    