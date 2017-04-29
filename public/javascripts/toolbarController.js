(function () {
  'use strict';

  angular.module('mediaMogulApp')
    .directive('toolbar', toolbar);

  function toolbar() {
    return {
      templateUrl: 'views/toolbar.html',
      controller: toolbarController,
      controllerAs: 'toolbar'
    }
  }

  function toolbarController(auth, store, $location) {
    var vm = this;
    vm.login = login;
    vm.logout = logout;
    vm.auth = auth;

    function login() {
      // The auth service has a signin method that
      // makes use of Auth0Lock. If authentication
      // is successful, the user's profile and token
      // are saved in local storage with the store service
      auth.signin({
        authParams: {
          scope: 'openid offline_access'
        }
      }, function(profile, idToken, accessToken, state, refreshToken) {
        store.set('profile', profile);
        store.set('token', idToken);
        store.set('accessToken', accessToken);
        store.set('refreshToken', refreshToken);
        console.log("ID Token: " + idToken);
        console.log("Refresh Token: " + refreshToken);
        $location.path('/tv/shows/main');
      }, function(error) {
        console.log(error);
      })
    }

    function logout() {
      // The signout method on the auth service
      // sets isAuthenticated to false but we
      // also need to remove the profile and
      // token from local storage
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $location.path('/');
    }
  }
})();