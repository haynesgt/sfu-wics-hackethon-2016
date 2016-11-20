
angular.module('appName', ['ngResource'])
.controller(
 'antGameController',
  function($scope, $http, $resource, $timeout, $interval) {

  var api;
  $scope.api = api = {
    users: $resource('/api/users'),
    colonies: $resource('/api/colonies'),
    resources: $resource('/api/resources'),
    grid: $resource('/api/grid'),
    workers: $resource('/api/colonies/:colonyId/workers', {colonyId: '@id'})
  };

  var gameReload = function() {
    api.colonies.get({}, function(data) {
      $scope.colonies = data;
      $scope.user.colony = data[$scope.user.colony.id];
    });
    api.grid.get(function(gridData) {
      $scope.gameGrid = gridData;
    });
  };

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
    user = api.users.save({}, function(userData) {
      $scope.user = user;
      $timeout(function() {
        colony = api.colonies.save(
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

  api.grid.get(function(gridData) {
    $scope.gameGrid = gridData;
  });

  $interval(gameReload, 1000);
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
      user: '=',
      api: '='
    },
    link: function(scope, elem, attrs) {
      scope.addWorker = function(resource) {
        scope.api.workers.save(
          {colonyId: scope.user.colony.id},
          {resourceId: resource.id}
        );
        scope.user.colony.workers.push({resourceId: resource.id});
      };
      scope.workingOn = function(col) {
        if (col.type != 'resource') {
          return false;
        }
        return _.find(user.colony.workers, function(worker) {
          return worker.resourceId == col.id;
        });
      };
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
