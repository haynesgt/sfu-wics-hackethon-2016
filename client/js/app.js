var resource;

angular.module('appName', ['ngResource'])
.controller('antGameController', function($scope, $http, $resource) {
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
      colony = colonies.save(
        {},
        {userId: userData.id, colonyName: $scope.beginData.colonyName},
        function(colonyData) {
          console.log(colonyData);
          gameReload();
          $scope.hasColony = true;
      });
    });
  };

  $scope.beginData = {};
  $scope.hasColony = false;

})
.directive('antGame', function($http) {
  return {
    restrict: 'AE',
    templateUrl: '/html/antGame.html'
  };
});

