angular.module('mediaMogulApp', ['auth0', 'angular-storage', 'angular-jwt', 'ngRoute', 'ui.bootstrap'])
  .config(['$routeProvider', 'authProvider', '$httpProvider', '$locationProvider', 'jwtInterceptorProvider',
    function($routeProvider, authProvider, $httpProvider, $locationProvider, jwtInterceptorProvider) {
      $routeProvider
        .when('/', {
          controller: 'gamesController as ctrl',
          templateUrl: 'views/games.html'
        })
        .when('/login', {
          controller: 'LoginCtrl',
          templateUrl: 'views/login.html',
          pageTitle: 'Login'
        })
      ;
      $routeProvider.otherwise({
        redirectTo: '/'
      });

      authProvider.init({
        domain: '',
        clientID: '',
        loginUrl: '/login'
      });

      //Called when login is successful
      authProvider.on('loginSuccess', ['$location', 'profilePromise', 'idToken', 'store',
        function($location, profilePromise, idToken, store) {

          console.log("Login Success");
          profilePromise.then(function(profile) {
            store.set('profile', profile);
            store.set('token', idToken);
          });

          $location.path('/');
        }]);

      //Called when login fails
      authProvider.on('loginFailure', function() {
        alert("Error");
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