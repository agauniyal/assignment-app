var app = angular.module('assignment-app', ['autocomplete']);

// the service that retrieves some movie title from an url
app.factory('collegesRet', function($http, $q, $timeout) {
  var collegesRet = new Object();

  collegesRet.getcollege = function(i) {
    var collegeData = $q.defer();
    var colleges;

    $http({
      method: 'GET',
      url: '/data/college'
    }).then(function mySucces(response) {
      colleges = response.data.college;
    }, function myError(response) {
      console.log('Error while retrieving colleges data');
    });

    $timeout(function() {
      collegeData.resolve(colleges);
    }, 1000);

    return collegeData.promise;
  };

  return collegesRet;
});

app.factory('degreesRet', function($http, $q, $timeout) {
  var degreesRet = new Object();

  degreesRet.getDegree = function(i) {
    var degreeData = $q.defer();
    var degrees;

    $http({
      method: 'GET',
      url: '/data/degree'
    }).then(function mySucces(response) {
      degrees = response.data.degree;
    }, function myError(response) {
      console.log('Error while retrieving degree data');
    });

    $timeout(function() {
      degreeData.resolve(degrees);
    }, 1000);

    return degreeData.promise;
  };

  return degreesRet;
});

app.controller('MyCtrl', function($scope, collegesRet, degreesRet) {

  $scope.colleges = collegesRet.getcollege('...');
  $scope.colleges.then(function(data) {
    $scope.colleges = data;
  });
  $scope.getcollege = function() {
    return $scope.colleges;
  };

  $scope.degrees = degreesRet.getDegree('...');
  $scope.degrees.then(function(data) {
    $scope.degrees = data;
  });
  $scope.getDegree = function() {
    return $scope.degrees;
  };
});
