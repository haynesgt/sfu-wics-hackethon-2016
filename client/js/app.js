var gameWidth = 20;
var gameHeight = 20;

angular.module('appName', ['ngResource'])
.controller('antGameController', function($scope, $http, $resource, $timeout) {
  var users = $resource('/api/users');
  var colonies = $resource('/api/colonies');
  var resources = $resource('/api/resources');
  var grid = $resource('/api/grid');

  var gameReload = function() {
    colonies.get({}, function(data) {
      $scope.colonies = data;
      console.log(data);
    });
  };

  gameReload();

  $scope.begin = function() {
    if ($scope.beginData.location && $scope.beginData.colonyName) {
      user = users.save({}, function(userData) {
        $timeout(function() {
          colony = colonies.save(
            {
              userId: userData.id,
              colonyName: $scope.beginData.colonyName,
              colonyLocation: $scope.beginData.location
            },
            function(colonyData) {
              $timeout(function() {
                gameReload();
                $scope.hasColony = true;
              }, 100);
            });
        }, 100);
      });
    }
  };

  $scope.beginData = {};
  $scope.hasColony = false;
  $scope.hasLocation = false;
  $scope.locations = [{x: 1, y: 2}];
  $scope.gameWidth = gameWidth;
  $scope.gameHeight = gameHeight;

  var i, j;
  gameGrid = new Array(gameHeight);
  for (i = 0; i < gameHeight; i++) {
    gameGrid[i] = new Array(gameWidth);
    for (j = 0; j < gameWidth; j++) {
      gameGrid[i][j] = {
        location: {x: j, y: i},
        data: 0
      };
    }
  }
  $scope.gameGrid = gameGrid;

  grid.get(function(gridData) {
    $scope.gameGrid = gridData;
  });
})
.directive('antGame', function($http) {
  return {
    restrict: 'AE',
    templateUrl: '/html/antGame.html'
  };
})
.directive('colonyCreator', function() {
  return {
    templateUrl: '/html/colonyCreator.html',
    scope: {
      beginData: '=',
      gameGrid: '=',
      begin: '=',
      hasColony: '='
    },
    link: function(scope, elem, attrs) {
      $(elem).find('.modal').modal({
        backdrop: 'static',
        keyboard: false
      });
      scope.$watch('hasColony', function(hasColony) {
        if (hasColony) {
          $(elem).find('.modal').modal('hide');
        }
      });
      scope.setLocation = function(col) {
        if (col.type == 'none') {
          scope.beginData.location = col.location;
        }
      };
    }
  };
});
