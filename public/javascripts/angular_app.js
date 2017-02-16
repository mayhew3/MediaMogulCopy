angular.module('mediaMogulApp', ['auth0', 'angular-storage', 'angular-jwt', 'ngRoute', 'ui.bootstrap', 'ui.router'])
  .config(['authProvider', '$httpProvider', '$locationProvider', 'jwtInterceptorProvider', '$provide', '$stateProvider',
    function(authProvider, $httpProvider, $locationProvider, jwtInterceptorProvider, $provide, $stateProvider) {

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/home.html'
        })
        .state('tv', {
          url: '/tv',
          templateUrl: 'views/tv/tv.html'
        })
        .state('tv.shows', {
          url: '/shows',
          controller: 'seriesController',
          controllerAs: 'ctrl',
          templateUrl: 'views/tv/shows/shows.html'
        })
        .state('tv.shows.main', {
          url: '/main',
          templateUrl: 'views/tv/shows/main.html'
        })
        .state('tv.shows.backlog', {
          url: '/backlog',
          templateUrl: 'views/tv/shows/backlog.html'
        })
        .state('tv.shows.new', {
          url: '/new',
          templateUrl: 'views/tv/shows/new.html'
        })
        .state('tv.shows.unmatched', {
          url: '/unmatched',
          templateUrl: 'views/tv/shows/unmatched.html'
        })
        .state('tv_list', {
          url: '/tvbacklog',
          templateUrl: 'views/tvbacklog.html'
        })
        .state('tv.rate', {
          url: '/tv/rate/yearly',
          controller: 'yearlyRatingController',
          controllerAs: 'ctrl',
          templateUrl: 'views/tv/rate/tvyearly.html'
        })
        .state('tv.match', {
          url: '/match',
          controller: 'matchController',
          controllerAs: 'ctrl',
          templateUrl: 'views/tv/match/match.html'
        })
        .state('tv.match.needsfirstpass', {
          url: '/needsfirstpass',
          templateUrl: 'views/tv/match/needsfirstpass.html'
        })
        .state('games', {
          url: '/games',
          templateUrl: 'views/games.html',
          controller: 'gamesController',
          controllerAs: 'ctrl'
        })
        .state('profile', {
          url: '/profile',
          templateUrl: 'views/profile.html',
          controller: 'profileController',
          controllerAs: 'user'
        })
      ;

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
              $location.path('/');
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
  .run(function($rootScope, auth, store, jwtHelper, $location, $state) {
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