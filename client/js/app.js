var resource;

angular.module('appName', ['ngResource'])
.controller('antGameController', function($scope, $http, $resource, $timeout) {
  resource = $resource;
  var users = $resource('/api/users');
  var colonies = $resource('/api/colonies');

  var gameReload = function() {
    colonies.get({}, function(data) {
      $scope.colonies = data;
    });
  };

  gameReload();

  $scope.begin = function() {
    user = users.save({}, function(userData) {
      console.log(userData);
      $timeout(function() {
        colony = colonies.save(
          {}, {userId: userData.id, colonyName: $scope.beginData.colonyName},
          function(colonyData) {
            console.log(colonyData);
            $timeout(function() {
              gameReload();
              $scope.hasColony = true;
            }, 100);
          });
      }, 100);
    });
  };

  $scope.beginData = {};
  $scope.hasColony = false;
  $scope.hasLocation = false;

  $scope.locations = [
    {x: 0, y: 3},
    {x: 1, y: 2},
    {x: 2, y: 1},
    {x: 3, y: 0},
  ];

})
.directive('antGame', function($http) {
  return {
    restrict: 'AE',
    templateUrl: '/html/antGame.html'
  };
});

