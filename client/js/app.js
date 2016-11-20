angular.module('appName', ['ngResource'])
.controller('antGameController', function($scope, $http, $resource, $timeout) {
  var users = $resource('/api/users');
  var colonies = $resource('/api/colonies');
  var resources = $resource('/api/resources');
  var grid = $resource('/api/grid');

  var gameReload = function() {
    colonies.get({}, function(data) {
      $scope.colonies = data;
    });
    grid.get(function(gridData) {
      $scope.gameGrid = gridData;
    });
  };

  gameReload();

  $scope.begin = function() {
    if (!$scope.beginData.location) {
      $scope.error = 'No Location';
      return;
    }
    if (!$scope.beginData.colonyName) {
      $scope.error = 'No Name';
      return;
    }
    $scope.error = '';
    user = users.save({}, function(userData) {
      $scope.user = user;
      $timeout(function() {
        colony = colonies.save(
          {
            userId: userData.id,
            colonyName: $scope.beginData.colonyName,
            colonyLocation: $scope.beginData.location
          },
          function(colonyData) {
            $scope.user.colony = colonyData.colony;
            $timeout(function() {
              gameReload();
              $scope.hasColony = true;
            }, 100);
          },
          function(errorData) {
            $scope.error = errorData.data;
          }
        );
      }, 100);
    });
  };

  $scope.beginData = {};
  $scope.hasColony = false;
  $scope.hasLocation = false;
  $scope.locations = [{x: 1, y: 2}];

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
      gameGrid: '=grid',
      begin: '=',
      hasColony: '=',
      error: '=',
      colonies: '='
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
})
.directive('gameGrid', function() {
  return {
    templateUrl: '/html/gameGrid.html',
    scope: {
      grid: '=',
      user: '='
    },
    link: function(scope, elem, attrs) {
    }
  };
})
.directive('gameSidebar', function() {
  return {
    scope: {
      'user': '='
    },
    templateUrl: '/html/gameSidebar.html',
  };
});
