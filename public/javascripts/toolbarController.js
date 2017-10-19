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
    var self = this;
    self.login = login;
    self.logout = logout;
    self.auth = auth;

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
        self.auth.roles = profile.app_metadata.roles;
        self.auth.isAdmin = function() {
          return this.isAuthenticated && _.contains(this.roles, 'admin');
        };
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
      self.auth.signout();
      store.remove('profile');
      store.remove('token');
      self.auth.roles = [];
      $location.path('/');
    }
  }
})();