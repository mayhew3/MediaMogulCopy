angular.module('mediaMogulApp', ['ngRoute', 'ui.bootstrap'])
  .config(function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/games.html'
    });
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  });