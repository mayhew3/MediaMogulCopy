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
        .state('mytv', {
          url: '/mytv',
          templateUrl: 'views/mytv/mytv.html'
        })
        .state('mytv.shows', {
          url: '/shows',
          controller: 'myShowsController',
          controllerAs: 'ctrl',
          templateUrl: 'views/mytv/shows/shows.html'
        })
        .state('mytv.shows.main', {
          url: '/main',
          templateUrl: 'views/mytv/shows/main.html'
        })
        .state('tv_list', {
          url: '/tvbacklog',
          templateUrl: 'views/tv/tvbacklog.html'
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
        .state('tv.match.seriesmatching', {
          url: '/seriesmatching',
          templateUrl: 'views/tv/match/seriesMatching.html'
        })
        .state('games', {
          url: '/games',
          templateUrl: 'views/games/games.html'
        })
        .state('games.list', {
          url: '/list',
          templateUrl: 'views/games/list.html',
          controller: 'gamesController',
          controllerAs: 'ctrl'
        })
        .state('games.dashboard', {
          url: '/dashboard',
          templateUrl: 'views/games/dashboard.html',
          controller: 'gameDashboardController',
          controllerAs: 'ctrl'
        })
        .state('admin', {
          url: '/admin',
          templateUrl: 'views/admin/admin.html'
        })
        .state('admin.tv', {
          url: '/tv',
          templateUrl: 'views/admin/tv/tv.html'
        })
        .state('admin.tv.tvdb', {
          url: '/tvdb_errors',
          controller: 'tvdbErrorsController',
          controllerAs: 'ctrl',
          templateUrl: 'views/admin/tv/tvdb_errors.html'
        })
        .state('profile', {
          url: '/profile',
          templateUrl: 'views/profile.html',
          controller: 'profileController',
          controllerAs: 'user'
        })
      ;

      authProvider.init({
        domain: 'mayhew3.auth0.com',
        clientID: 'QdwQv7LcXgmiUpYhXnTYyGQsXie2UQNb'
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
              store.remove('public_id');
              $location.path('/');
            }
            return $q.reject(rejection);
          }
        }
      }
      $provide.factory('redirect', redirect);
      $httpProvider.interceptors.push('redirect');

      var refreshingToken = null;

      //Angular HTTP Interceptor function
      jwtInterceptorProvider.tokenGetter =
        ['store', '$http', 'jwtHelper', 'auth',
          function(store, $http, jwtHelper, auth) {
            var token = store.get('token');
            var refreshToken = store.get('refreshToken');
            if (token) {
              if (!jwtHelper.isTokenExpired(token)) {
                return token;
              } else {
                console.log("RefreshToken: " + refreshToken);
                if (refreshingToken === null) {
                  if (refreshToken !== null) {
                    refreshingToken = auth.refreshIdToken(refreshToken).then(function (idToken) {
                      store.set('token', idToken);
                      return idToken;
                    }, function(err) {
                      console.log(err);
                      store.remove('refreshToken');
                      refreshToken = null;
                      return null;
                    }).finally(function () {
                      refreshingToken = null;
                    });
                  }
                }
                return refreshingToken;
              }
            }
          }];

      //Push interceptor function to $httpProvider's interceptors
      $httpProvider.interceptors.push('jwtInterceptor');

    }])
  .run(['$rootScope', 'auth', 'store', 'jwtHelper', '$location',
    function($rootScope, auth, store, jwtHelper, $location) {

      var refreshingToken = null;
      auth.hookEvents();
      $rootScope.$on('$locationChangeStart', function() {
        // Get the JWT that is saved in local storage
        // and if it is there, check whether it is expired.
        // If it isn't, set the user's auth state
        var token = store.get('token');
        var refreshToken = store.get('refreshToken');
        var profile = store.get('profile');
        var person_id = store.get('person_id');

        console.log("On Refresh: Store PersonID: " + person_id + ", Auth PersonID: " + auth.person_id);

        if (token) {
          if (!jwtHelper.isTokenExpired(token)) {
            if (!auth.isAuthenticated) {
              auth.authenticate(profile, token);
              updateAuthObjectFromStore(profile);
            }
          } else {
            if (refreshToken) {
              if (refreshingToken === null) {
                refreshingToken = auth.refreshIdToken(refreshToken).then(function(idToken) {
                  store.set('token', idToken);
                  auth.authenticate(profile, idToken);
                  updateAuthObjectFromStore(profile);
                }, function(err) {
                  console.log(err);
                  store.remove('refreshToken');
                  refreshToken = null;
                  return null;
                }).finally(function() {
                  refreshingToken = null;
                });
              }
              // do I need this here?
              updateAuthObjectFromStore(profile);
              return refreshingToken;
            } else {
              $location.path('/');
            }
          }

        } else {
          // Otherwise, redirect to the home route
          $location.path('/');
        }
      });

      function updateAuthObjectFromStore(profile) {
        if (isNaN(auth.person_id)) {
          console.log("Setting auth person id to: " + store.get('person_id'));
          auth.person_id = store.get('person_id');
        }

        auth.roles = profile.app_metadata.roles;
        auth.isAdmin = function () {
          return auth.isAuthenticated && _.contains(auth.roles, 'admin');
        };
        auth.isUser = function () {
          return auth.isAuthenticated && _.contains(auth.roles, 'user');
        };
      }

  }])
  .directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    }
  });