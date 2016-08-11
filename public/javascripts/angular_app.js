angular.module('mediaMogulApp', ['auth0', 'angular-storage', 'angular-jwt', 'ngRoute', 'ui.bootstrap'])
  .config(['$routeProvider', 'authProvider', '$httpProvider', '$locationProvider', 'jwtInterceptorProvider',
    function($routeProvider, authProvider, $httpProvider, $locationProvider, jwtInterceptorProvider) {
      $routeProvider
        .when('/', {
          controller: 'gamesController',
          controllerAs: 'ctrl',
          templateUrl: 'views/games.html',
          requiresLogin: true
        })
      ;
      $routeProvider.otherwise({
        redirectTo: '/'
      });

      authProvider.init({
        domain: '',
        clientID: ''
      });

      //Angular HTTP Interceptor function
      jwtInterceptorProvider.tokenGetter = ['store', function(store) {
        return store.get('token');
      }];

      //Push interceptor function to $httpProvider's interceptors
      $httpProvider.interceptors.push('jwtInterceptor');

    }])
  .run(['auth', function(auth) {
    auth.hookEvents();
  }])
;