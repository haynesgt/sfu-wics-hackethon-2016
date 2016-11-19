angular.module('appName', [])
.directive('antGame', function() {
  return {
    restrict: 'AE',
    templateUrl: '/html/antGame.html',
    link: function(scope, elem, attrs) {
      scope.colonies = [{name: 'first'}, {name: 'second'}];
    }
  };
});

