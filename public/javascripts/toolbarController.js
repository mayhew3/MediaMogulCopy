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

  function toolbarController(auth, store, $location, $http) {
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
        syncPersonWithDB(profile);
        
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


    // user management functions

    function syncPersonWithDB(profile) {
      var email = profile.email;

      $http.get('/person', {params: {email: email}}).then(function (response) {
        var personData = response.data;
        console.log("User info found: " + personData.length + " rows.");

        if (personData.length === 0) {
          addPersonToDB(profile);
        } else {
          copyPersonInfoToAuth(personData);
        }

        self.auth.roles = profile.app_metadata.roles;
        self.auth.isAdmin = function () {
          return this.isAuthenticated && _.contains(this.roles, 'admin');
        };
        $location.path('/tv/shows/main');
      });
    }

    function addPersonToDB(profile) {
      console.log("No person found. Adding: " + profile.user_metadata.first_name);
      var user_metadata = profile.user_metadata;
      $http.post('/addPerson', {
        Person: {
          email: profile.email,
          first_name: user_metadata.first_name,
          last_name: user_metadata.last_name
        }
      }).then(function (response) {
        console.log("Added successfully. Person ID: " + response.data.PersonId);
        self.auth.person_id = response.data.PersonId;
      }, function (err) {
        console.log("Error adding person to DB: " + err);
      });
    }

    function copyPersonInfoToAuth(personData) {
      var personInfo = personData[0];
      console.log("Name: " + personInfo.first_name + " " + personInfo.last_name);
      console.log("ID: " + personInfo.id);

      self.auth.firstName = personInfo.first_name;
      self.auth.lastName = personInfo.last_name;
      self.auth.person_id = personInfo.id;
    }

  }

})();