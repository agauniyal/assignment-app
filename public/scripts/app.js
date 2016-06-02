var app = angular.module('assignment-app', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/about', {
      templateUrl: 'about.html',
      controller: aboutController
    })
    .otherwise({
      redirectTo: '/'
    });

  function aboutController($scope, $http) {
    $http({
      method: 'GET',
      url: '/profile'
    }).then(function mySuccess(response) {

      $scope.username = response.data.username;
      $scope.college = response.data.college;
      $scope.degree = response.data.degree;
    }, function myError(response) {
      console.log('Error while retrieving colleges data');
    });
  }
});

app.controller('autoCompleteCTRL', function($scope, $rootScope, $http) {

  $rootScope.selectedCollege = '';
  $rootScope.collegeList = [];
  $rootScope.degreeList = [];

  $http({
    method: 'GET',
    url: '/data/college'
  }).then(function mySuccess(response) {
    $rootScope.collegeList = response.data;
  }, function myError(response) {
    console.log('Error while retrieving colleges data');
  });

  $scope.fillDegrees = function(selectedCollege) {
    var finalUrl = '/data/college?college=' + selectedCollege;
    $http({
      method: 'GET',
      url: finalUrl
    }).then(function mySuccess(response) {
      $rootScope.degreeList = response.data;
    }, function myError(response) {
      console.log('Error while retrieving colleges data');
    });
  }

  $scope.searchItems = [];
  $scope.suggestions = [];
  $scope.selectedIndex = -1;

  //Function To Call On ng-change
  $scope.search = function(dataSet) {
    if (dataSet == 'college') {
      $scope.searchItems = $rootScope.collegeList;
    } else {
      $scope.searchItems = $rootScope.degreeList;
    }
    $scope.suggestions = [];
    var myMaxSuggestionListLength = 0;
    for (var i = 0; i < $scope.searchItems.length; i++) {
      var searchItemsSmallLetters = angular.lowercase($scope.searchItems[i]);
      var searchTextSmallLetters = angular.lowercase($scope.searchText);
      if (searchItemsSmallLetters.indexOf(searchTextSmallLetters) !== -1) {
        $scope.suggestions.push(searchItemsSmallLetters);
        myMaxSuggestionListLength += 1;
        if (myMaxSuggestionListLength === 5) {
          break;
        }
      }
    }
  };

  //Keep Track Of Search Text Value During The Selection From The Suggestions List
  $scope.$watch('selectedIndex', function(val) {
    if (val !== -1) {
      $scope.searchText = $scope.suggestions[$scope.selectedIndex];
      if ($scope.searchItems === $rootScope.collegeList) {
        $rootScope.selectedCollege = $scope.searchText;
        $scope.fillDegrees($rootScope.selectedCollege);
      }
    }
  });

  //Text Field Events
  $scope.checkKeyDown = function(event) {
    if (event.keyCode === 40) { //down key, increment selectedIndex
      event.preventDefault();
      if ($scope.selectedIndex + 1 < $scope.suggestions.length) {
        $scope.selectedIndex++;
      } else {
        $scope.selectedIndex = 0;
      }
    } else if (event.keyCode === 38) { //up key, decrement selectedIndex
      event.preventDefault();
      if ($scope.selectedIndex - 1 >= 0) {
        $scope.selectedIndex--;
      } else {
        $scope.selectedIndex = $scope.suggestions.length - 1;
      }
    } else if (event.keyCode === 13) { //enter key, empty suggestions array
      event.preventDefault();
      $scope.suggestions = [];
      $scope.selectedIndex = -1;
    } else if (event.keyCode === 27) { //ESC key, empty suggestions array
      event.preventDefault();
      $scope.suggestions = [];
      $scope.selectedIndex = -1;
    } else {
      $scope.search();
    }
  };

  var exclude1 = document.getElementById('collegeField');
  var exclude2 = document.getElementById('degreeField');
  $scope.hideMenu = function($event) {
    $scope.search();
    if (($event.target !== exclude1) || ($event.target !== exclude2)) {
      $scope.suggestions = [];
      $scope.selectedIndex = -1;
    }
  };

  //Function To Call on ng-keyup
  $scope.checkKeyUp = function(event) {
    if (event.keyCode !== 8 || event.keyCode !== 46) { //delete or backspace
      if ($scope.searchText === '') {
        $scope.suggestions = [];
        $scope.selectedIndex = -1;
      }
    }
  };

  //Function To Call on ng-click
  $scope.AssignValueAndHide = function(index) {
    $scope.searchText = $scope.suggestions[index];
    $scope.suggestions = [];
    $scope.selectedIndex = -1;
    if ($scope.searchItems === $rootScope.collegeList) {
      $rootScope.selectedCollege = $scope.searchText;
      $scope.fillDegrees($rootScope.selectedCollege);
    }
  };
});
