angular.module('mediaMogulApp', ['ngRoute', 'ui.bootstrap'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/games.html'
      })
      .when('/login', {
        templateUrl: 'views/login.html'
      })
    ;
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  });