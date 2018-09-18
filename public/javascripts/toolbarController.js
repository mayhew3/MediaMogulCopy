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

  function toolbarController(lock, store, $location, $http) {
    var self = this;
    self.login = login;
    self.logout = logout;
    self.auth = lock;

    function login() {
      lock.show();
    }

    function logout() {
      // The signout method on the auth service
      // sets isAuthenticated to false but we
      // also need to remove the profile and
      // token from local storage
      self.auth.signout();
      store.remove('profile');
      store.remove('token');
      store.remove('person_id');
      self.auth.roles = [];
      self.auth.person_id = undefined;
      $location.path('/');
    }

    function handleAuthentication() {
      console.log("Listeners being added.");
      self.auth.on('authenticated', function(authResult) {
        console.log("Authenticated event detected.");
        if (authResult && authResult.accessToken && authResult.idToken) {
          console.log('Authenticated!', authResult);
          _setSession(authResult);
        }
      });
      self.auth.on('authorization_error', function(err) {
        console.log(err);
        alert('Error: ' + err.error + ". Check the console for further details.");
      });
    }

    handleAuthentication();

    function _setSession(authResult) {
      // Set the time that the Access Token will expire
      var expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      );
      // Save tokens and expiration to localStorage
      store.set('profile', authResult.profile);
      store.set('access_token', authResult.accessToken);
      store.set('token', authResult.idToken);
      store.set('refresh_token', authResult.refreshToken);
      store.set('expires_at', expiresAt);

      syncPersonWithDB(authResult.profile);
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
        console.log("roles found: " + self.auth.roles.length);
        self.auth.isAdmin = function () {
          return this.isAuthenticated && _.contains(this.roles, 'admin');
        };
        self.auth.isUser = function () {
          return this.isAuthenticated && _.contains(this.roles, 'user');
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

        console.log("Setting store with person id: " + self.auth.person_id);
        store.set('person_id', self.auth.person_id);
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

      console.log("Setting store with person id: " + self.auth.person_id);
      store.set('person_id', self.auth.person_id);
    }

  }

})();