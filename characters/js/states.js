(function() {

angular.module('optc').config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/search/');

    $stateProvider

        .state('main',{
            templateUrl: 'characters/views/main.html',
            controller: 'MainCtrl',
            abstract: true
        })

        .state('main.search',{
            url: '^/search/:query',
            views: { '-': { template: '<div></div>' } }
        })

        .state('main.search.view',{
            url: '^/view/:id',
            params: { previous: [ ] },
            views: {
                'popup@': {
                    templateUrl: 'characters/views/details.html',
                    controller: 'DetailsCtrl',
                }
            },
        });

});

})();
