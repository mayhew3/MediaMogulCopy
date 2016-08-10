angular.module('mediaMogulApp')
  .controller('LoginCtrl', ['$scope', 'auth', function ($scope, auth) {
    $scope.user = '';
    $scope.pass = '';

    $scope.message = {text: ''};

    $scope.doGoogleAuthWithPopup = function () {
      $scope.message.text = 'loading...';
      $scope.loading = true;

      auth.signin({
        connection: 'google-oauth2',
        scope: 'openid name email'
      });
    };

    /*
    $scope.auth = auth;

    $scope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $location.path('/login');
    };

    $scope.resetPassword = function(){
      auth.reset({
        connection: 'Username-Password-Authentication'
      });
    };
    */
  }]);