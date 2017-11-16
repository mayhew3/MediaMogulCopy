angular.module('mediaMogulApp')
  .controller('findShowController', ['$log', 'auth',
    function($log, auth) {
      var self = this;

      self.auth = auth;

      self.selected = undefined;

      self.shows = [
        {
          name:'Halt and Catch Fire',
          id: 28,
          poster: 'posters/271910-11.jpg'
        },
        {
          name:'The Leftovers',
          id: 323,
          poster: 'posters/269689-14.jpg'
        },
        {
          name:'The Handmaid\'s Tale',
          id: 1088,
          poster: 'posters/321239-8.jpg'
        },
        {
          name:'Planet Earth II',
          id: 859,
          poster: 'posters/318408-8.jpg'
        }
      ];


      self.amendPosterLocation = function(posterPath) {
        return posterPath ? 'http://thetvdb.com/banners/' + posterPath : 'images/GenericSeries.gif';
      }

    }
  ]);