angular.module('mediaMogulApp', ['auth0', 'angular-storage', 'angular-jwt', 'ngRoute', 'ui.bootstrap'])
  .config(['$routeProvider', 'authProvider', '$httpProvider', '$locationProvider', 'jwtInterceptorProvider', '$provide',
    function($routeProvider, authProvider, $httpProvider, $locationProvider, jwtInterceptorProvider, $provide) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html'
        })
        .when('/home', {
          templateUrl: 'views/home.html'
        })
        .when('/games', {
          controller: 'gamesController',
          controllerAs: 'ctrl',
          templateUrl: 'views/games.html'
        })
        .when('/profile', {
          controller: 'profileController',
          controllerAs: 'user',
          templateUrl: 'views/profile.html'
        })
        .when('/tv', {
            templateUrl: 'views/tv.html'
        })
        .when('/tvbacklog', {
          templateUrl: 'views/tvbacklog.html'
        })
      ;
      $routeProvider.otherwise({
        redirectTo: '/'
      });

      authProvider.init({
        domain: 'app40365095.auth0.com',
        clientID: 'dSHWdaxORGRtRUFi8WdGCzlECwAmSxF4'
      });

      function redirect($q, $injector, $timeout, store, $location) {
        var auth;
        $timeout(function() {
          auth = $injector.get('auth');
        });

        return {
          responseError: function(rejection) {

            if (rejection.status === 401) {
              auth.signout();
              store.remove('profile');
              store.remove('token');
              $location.path('/')
            }
            return $q.reject(rejection);
          }
        }
      }
      $provide.factory('redirect', redirect);
      $httpProvider.interceptors.push('redirect');


      //Angular HTTP Interceptor function
      jwtInterceptorProvider.tokenGetter = ['store', function(store) {
        return store.get('token');
      }];

      //Push interceptor function to $httpProvider's interceptors
      $httpProvider.interceptors.push('jwtInterceptor');

    }])
  .run(function($rootScope, auth, store, jwtHelper, $location) {
    auth.hookEvents();
    $rootScope.$on('$locationChangeStart', function() {
      // Get the JWT that is saved in local storage
      // and if it is there, check whether it is expired.
      // If it isn't, set the user's auth state
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if (!auth.isAuthenticated) {
            auth.authenticate(store.get('profile'), token);
          }
        }
      }
      else {
        // Otherwise, redirect to the home route
        $location.path('/');
      }
    });

  })
;