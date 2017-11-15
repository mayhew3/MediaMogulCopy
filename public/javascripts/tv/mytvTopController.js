angular.module('mediaMogulApp')
  .controller('mytvTopController', ['auth',
    function(auth) {
      var self = this;

      self.auth = auth;

    }
  ]);